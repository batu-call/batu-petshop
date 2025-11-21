"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

type Message = { user?: string; bot?: string };

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { user: input }]);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/generate", { prompt: input });
      setMessages((prev) => [...prev, { bot: response.data.text }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { bot: "Error: Something went wrong" }]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col h-[90vh] bg-primary">
      <div className="flex-1 border rounded p-4 overflow-y-auto mb-4 flex flex-col gap-2 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className="break-words">
            {msg.user && <div className="text-right text-blue-600"><b>You:</b> {msg.user}</div>}
            {msg.bot && <div className="text-left text-green-600"><b>Bot:</b> {msg.bot}</div>}
          </div>
        ))}
        {loading && <div className="text-left text-gray-500">Bot is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mesajınızı yazın..."
        />
        <button
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
