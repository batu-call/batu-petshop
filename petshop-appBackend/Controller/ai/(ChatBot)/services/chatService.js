import Groq from "groq-sdk";
import { tools } from "../tools/index.js";
import { toolDefinitions } from "../toolDefinitions/index.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELS = [
  "llama-3.3-70b-versatile",
];

const MAX_TOOL_CHARS  = 2500;
const MAX_TOOL_ROUNDS = 5;

const FALLBACK_FORMAT_REMINDER = `

CRITICAL FORMAT REMINDER:
- For products: ALWAYS output a JSON block like this, no exceptions:
\`\`\`json
[{"_id":"...","product_name":"...","price":0,"salePrice":null,"image":[{"url":"..."}],"slug":"...","category":"...","stock":0}]
\`\`\`
- NEVER output a numbered list like "1. Product Name - $price". ALWAYS use the JSON block above.
- For order summary: output ONLY \`\`\`json\n{"total":0,"pending":0,...}\`\`\`
- For cart: output ONLY \`\`\`json\n{"itemCount":0,"items":[...],"total":0}\`\`\`
`;

const trimResult = (result) => {
  const compact = Array.isArray(result)
    ? result.map((item) => {
        if (!item || typeof item !== "object" || !item.image) return item;
        return {
          ...item,
          image: item.image?.length ? [{ url: item.image[0].url }] : [],
        };
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

const extractFromFailedGen = (text) => {
  try {
    const nameMatch = text.match(/<function=(\w+)/);
    if (!nameMatch) return null;
    const name = nameMatch[1];
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const args = JSON.parse(jsonMatch[0]);
    return { name, args };
  } catch (e) {
    return null;
  }
};

const executeTools = (toolList) =>
  Promise.all(
    toolList.map(async ({ name, args, id }) => {
      const fn = tools[name];
      let result;
      try {
        result = await Promise.race([
          fn ? fn(args) : Promise.resolve({ error: "Unknown tool" }),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error("Timeout")), 5000),
          ),
        ]);
      } catch (err) {
        result = { error: err.message };
      }
      return { id, name, result };
    }),
  );

const callGroq = async (msgs, withTools = true, modelIndex = 0) => {
  const isFallback = modelIndex > 0;

  let finalMsgs = msgs;
  if (isFallback) {
    finalMsgs = msgs.map((m, i) =>
      i === 0 && m.role === "system"
        ? { ...m, content: m.content + FALLBACK_FORMAT_REMINDER }
        : m
    );
  }

  const opts = {
    model: MODELS[modelIndex],
    messages: finalMsgs,
    max_tokens: 1024,
    temperature: isFallback ? 0.1 : 0.3, 
  };
  if (withTools) {
    opts.tools = toolDefinitions;
    opts.tool_choice = "auto";
  }
  try {
    return await groq.chat.completions.create(opts);
  } catch (err) {
    if (err?.status === 429 && modelIndex < MODELS.length - 1) {
      console.warn(`[Groq] ${MODELS[modelIndex]} rate limited, switching to ${MODELS[modelIndex + 1]}`);
      return callGroq(msgs, withTools, modelIndex + 1);
    }

    const failedGen =
      err?.error?.failed_generation ??
      err?.error?.error?.failed_generation;

    if (!failedGen) throw err;

    const parsed = extractFromFailedGen(failedGen);
    if (!parsed) throw err;

    const xmlResults = await executeTools([
      { id: "fallback-0", name: parsed.name, args: parsed.args },
    ]);

    msgs.push({
      role: "user",
      content: `Tool results:\n${xmlResults
        .map(({ name, result }) => `${name}: ${trimResult(result)}`)
        .join("\n")}\nRespond based on these results only.`,
    });

    return groq.chat.completions.create({
      model: MODELS[modelIndex],
      messages: msgs,
      max_tokens: 1024,
      temperature: 0.1,
    });
  }
};

const runToolLoop = async (messages, newMessages) => {
  let response = await callGroq(messages);
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
      })),
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

    const nextResponse = await callGroq(messages);
    assistantMsg = nextResponse.choices[0].message;
  }

  return assistantMsg;
};

export const runChat = async (systemPrompt, userMessage, history = []) => {
  const newMessages = [{ role: "user", content: userMessage }];

  const cleanHistory = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && !m.tool_calls)
    .slice(-6);

  const messages = [
    { role: "system", content: systemPrompt },
    ...cleanHistory,
    { role: "user", content: userMessage },
  ];

  const assistantMsg = await runToolLoop(messages, newMessages);
  newMessages.push({ role: "assistant", content: assistantMsg.content || "" });

  return { answer: assistantMsg.content || "", newMessages };
};