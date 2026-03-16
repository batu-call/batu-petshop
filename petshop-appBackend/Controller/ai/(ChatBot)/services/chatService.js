import Groq from "groq-sdk";
import { tools } from "../tools/index.js";
import { toolDefinitions } from "../toolDefinitions/index.js";

const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";
const MAX_TOOL_CHARS = 1500;
const MAX_TOOL_ROUNDS = 5; 

// ── Helpers 

const trimResult = (result) => {
  const compact = Array.isArray(result)
    ? result.map((item) => {
        if (!item || typeof item !== "object" || !item.image) return item;
        return { ...item, image: item.image?.length ? [{ url: item.image[0].url }] : [] };
      })
    : result;
  const str = JSON.stringify(compact);
  if (str.length <= MAX_TOOL_CHARS) return str;
  if (Array.isArray(compact)) return JSON.stringify(compact.slice(0, 3));
  return str.slice(0, MAX_TOOL_CHARS);
};

const safeParseArgs = (raw) => {
  if (!raw || raw.trim() === "") return {};
  try {
    return JSON.parse(raw);
  } catch {
    
    try {
      let fixed = raw.trim();
      if (!fixed.endsWith("}")) fixed += "}";
      return JSON.parse(fixed);
    } catch {
      return {};
    }
  }
};

const XML_TOOL_RE = /<function=(\w+)\s+(\{.*?\})\s*(?:\/>|<\/function>)/gs;

const parseXmlToolCalls = (text) => {
  const calls = [];
  let match;
  while ((match = XML_TOOL_RE.exec(text)) !== null) {
    try { calls.push({ name: match[1], args: JSON.parse(match[2]) }); } catch (_) {}
  }
  XML_TOOL_RE.lastIndex = 0;
  return calls;
};

// ── Tool Executor

const executeTools = (toolList) =>
  Promise.all(
    toolList.map(async ({ name, args, id }) => {
      const fn = tools[name];
      let result;
      try {
        result = await Promise.race([
          fn ? fn(args) : Promise.resolve({ error: "Unknown tool" }),
          new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), 5000)),
        ]);
      } catch (err) {
        result = { error: err.message };
      }
      return { id, name, result };
    })
  );

// ── Tool Loop \
const runToolLoop = async (messages, newMessages) => {
  let response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    tools: toolDefinitions,
    tool_choice: "auto",
    max_tokens: 1024,
    temperature: 0.3,
  });

  let assistantMsg = response.choices[0].message;
  let rounds = 0;

  while (assistantMsg.tool_calls?.length > 0 && rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    messages.push(assistantMsg);
    newMessages.push({
      role: "assistant",
      content: assistantMsg.content || "",
      tool_calls: assistantMsg.tool_calls,
    });

    const results = await executeTools(
      assistantMsg.tool_calls.map((c) => ({
        id: c.id,
        name: c.function.name,
        args: safeParseArgs(c.function.arguments),
      }))
    );

    for (const { id, result } of results) {
      const msg = {
        role: "tool",
        tool_call_id: id,
        content: trimResult(result),
      };
      messages.push(msg);
      newMessages.push(msg);
    }

    let nextResponse;
    try {
      nextResponse = await groq.chat.completions.create({
        model: MODEL,
        messages,
        tools: toolDefinitions,      
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.3,
      });
    } catch (err) {
      if (err?.status === 400 && err?.error?.failed_generation) {
        const xmlCalls = parseXmlToolCalls(err.error.failed_generation);
        if (xmlCalls.length > 0) {
          const xmlResults = await executeTools(
            xmlCalls.map((c, i) => ({ id: `xml-${i}`, ...c }))  
          );
          messages.push({
            role: "user",
            content: `Tool results:\n${xmlResults
              .map(({ name, result }) => `${name}: ${trimResult(result)}`)
              .join("\n")}\nRespond based on these results only.`,
          });
          nextResponse = await groq.chat.completions.create({
            model: MODEL,
            messages,
            max_tokens: 1024,
            temperature: 0.3,
          });
        } else throw err;
      } else throw err;
    }

    assistantMsg = nextResponse.choices[0].message;
  }

  return assistantMsg;
};

// ── Main Chat Runner 

export const runChat = async (systemPrompt, userMessage, history = []) => {
  const newMessages = [{ role: "user", content: userMessage }];

  const cleanHistory = history.filter(
    (m) => (m.role === "user" || m.role === "assistant") && !m.tool_calls
  );

  const messages = [
    { role: "system", content: systemPrompt },
    ...cleanHistory,
    { role: "user", content: userMessage },
  ];

  const assistantMsg = await runToolLoop(messages, newMessages);
  newMessages.push({ role: "assistant", content: assistantMsg.content || "" });

  return { answer: assistantMsg.content || "", newMessages };
};