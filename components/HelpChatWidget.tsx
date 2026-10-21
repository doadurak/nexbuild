"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { LifeBuoy, X, Send, Bot, User } from "lucide-react";

interface Message {
  role: "bot" | "user";
  text: string;
}

const FAQ: { question: string; answer: string; keywords: string[] }[] = [
  {
    question: "What is the CPM engine?",
    answer:
      "It's a real forward/backward-pass Critical Path Method calculation — it computes Early/Late Start & Finish and float for every task from your task durations and dependencies, client-side, no mock numbers.",
    keywords: ["cpm", "engine"],
  },
  {
    question: "What does \"critical path\" mean?",
    answer:
      "The chain of tasks with zero float — if any of them slips by a day, the whole project finish date slips by a day. You'll see those tasks marked in red across the app.",
    keywords: ["critical path", "float"],
  },
  {
    question: "How do I add a construction plan?",
    answer:
      "Open Construction in the left menu. You can upload your own drawing, or try one of the two samples — a schematic blueprint or a real public-domain floor plan — then click the drawing to pin schedule activities onto it.",
    keywords: ["plan", "drawing", "upload", "blueprint"],
  },
  {
    question: "How is cost estimated in Scenario Explorer?",
    answer:
      "Each scenario re-runs the real CPM engine on a modified task graph (extra crew, overtime, delays...), then multiplies the resulting duration by a blended daily rate. The duration is always genuinely computed — the cost is an illustrative estimate on top of it.",
    keywords: ["scenario", "cost", "explorer"],
  },
];

const GENERIC_REPLY =
  "I don't have a canned answer for that one yet — try the Copilot bubble in the bottom-right for project-specific questions, or ask me about the CPM engine, critical path, construction plans, or scenario costs.";

export default function HelpChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi, I'm the NexBuild.ai assistant. Ask me how anything in the app works." },
  ]);
  const [inputValue, setInputValue] = useState("");

  const ask = (question: string, answer: string) => {
    setMessages((prev) => [...prev, { role: "user", text: question }, { role: "bot", text: answer }]);
  };

  const submit = () => {
    const q = inputValue.trim();
    if (!q) return;
    const ql = q.toLowerCase();
    const match = FAQ.find((f) => f.keywords.some((k) => ql.includes(k)));
    setMessages((prev) => [...prev, { role: "user", text: q }, { role: "bot", text: match?.answer ?? GENERIC_REPLY }]);
    setInputValue("");
  };

  const pathname = usePathname();
  if (pathname === "/promo") return null;

  return (
    <>
      {open && (
        <div className="nb-fab-panel fixed bottom-24 left-6 z-40 w-[22rem] max-w-[calc(100vw-3rem)] h-[28rem] max-h-[calc(100vh-8rem)] bg-white dark:bg-[#0E141F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-2 text-white">
              <LifeBuoy className="w-4 h-4" />
              <span className="font-semibold text-sm">NexBuild Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-[#0B0F17]">
            {messages.map((m, i) =>
              m.role === "bot" ? (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 dark:bg-slate-700 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-slate-800 dark:text-slate-200 max-w-[85%]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2 justify-end">
                  <div className="bg-slate-700 text-white rounded-xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%]">{m.text}</div>
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              )
            )}

            {messages.length <= 1 && (
              <div className="space-y-1.5 pt-1">
                {FAQ.map((f) => (
                  <button
                    key={f.question}
                    onClick={() => ask(f.question, f.answer)}
                    className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg px-3 py-2 transition-colors"
                  >
                    {f.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0E141F]">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus-within:border-slate-400 dark:focus-within:border-slate-600">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Ask about the app..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0"
              />
              <button onClick={submit} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-lg flex items-center justify-center transition-colors"
        title={open ? "Close assistant" : "Ask about NexBuild.ai"}
      >
        {open ? <X className="w-6 h-6" /> : <LifeBuoy className="w-6 h-6" />}
      </button>
    </>
  );
}
