"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  X,
  Search,
  Send,
  User,
  Bot,
  Paperclip,
  Smile,
  ChevronDown,
  Waypoints,
} from "lucide-react";
import { useCpmConsole } from "./CpmConsoleProvider";
import { CRITICAL_PATH_TASKS, type CriticalPathTask } from "@/lib/taskData";

interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

const GENERAL_ID = "general";

function seedTaskMessage(t: CriticalPathTask): ChatMessage {
  const risk =
    t.status === "CRITICAL"
      ? `This task is on the critical path with ${t.float} float — it's already running ${t.delay} behind schedule.`
      : t.status === "RISK"
      ? `This task has ${t.float} float, so it's at risk: any further slip removes its buffer and it joins the critical path.`
      : t.status === "PENDING"
      ? `This task hasn't started yet. It currently has ${t.float} float against the baseline.`
      : `This task has ${t.float} float — there's some buffer before it would affect the project finish date.`;
  return {
    role: "bot",
    text: `${risk} It's assigned to ${t.assignee}, planned duration ${t.duration}. Ask me about its delay, crew, or what happens if it slips further.`,
  };
}

function taskReply(t: CriticalPathTask, question: string): string {
  const q = question.toLowerCase();
  if (q.includes("delay") || q.includes("late") || q.includes("slip")) {
    return t.delay === "0d"
      ? `${t.id} isn't delayed yet — ${t.float} float remains before it threatens the finish date.`
      : `${t.id} is currently ${t.delay} behind baseline. With ${t.float} float, that's ${t.float.startsWith("-") ? "already eating into the critical path" : "still within its buffer"}.`;
  }
  if (q.includes("crew") || q.includes("assign") || q.includes("who")) {
    return `${t.id} is assigned to ${t.assignee}.`;
  }
  if (q.includes("float") || q.includes("buffer")) {
    return `${t.id} has ${t.float} float. ${t.float === "0d" || t.float.startsWith("-") ? "That means it's on the critical path — zero room to slip." : "It can absorb a small slip before affecting the project finish date."}`;
  }
  if (q.includes("duration") || q.includes("long") || q.includes("how")) {
    return `${t.id} is planned for ${t.duration}.`;
  }
  return `${t.id} (${t.name}) is currently ${t.status.toLowerCase()}, ${t.float} float, assigned to ${t.assignee}. Try asking about its delay, crew, or float.`;
}

export default function CopilotCenterModal({
  open,
  initialTaskId,
  onClose,
}: {
  open: boolean;
  initialTaskId?: string;
  onClose: () => void;
}) {
  const { openConsole } = useCpmConsole();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(GENERAL_ID);
  const [taskThreads, setTaskThreads] = useState<Record<string, ChatMessage[]>>({});
  const [generalExpanded, setGeneralExpanded] = useState(false);
  const [generalAsked, setGeneralAsked] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Adjust the active thread when the modal transitions to open, per React's
  // "adjusting state when a prop changes" pattern — done during render rather
  // than in an effect, so it doesn't trigger an extra commit.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setActiveId(initialTaskId ?? GENERAL_ID);
      const task = initialTaskId ? CRITICAL_PATH_TASKS.find((t) => t.id === initialTaskId) : undefined;
      if (task) {
        setTaskThreads((prev) => (prev[task.id] ? prev : { ...prev, [task.id]: [seedTaskMessage(task)] }));
      }
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CRITICAL_PATH_TASKS;
    return CRITICAL_PATH_TASKS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)
    );
  }, [query]);

  const activeTask = CRITICAL_PATH_TASKS.find((t) => t.id === activeId) ?? null;

  const openTask = (t: CriticalPathTask) => {
    setActiveId(t.id);
    setTaskThreads((prev) => (prev[t.id] ? prev : { ...prev, [t.id]: [seedTaskMessage(t)] }));
  };

  const handleViewAnalysis = () => {
    onClose();
    openConsole();
  };

  const send = () => {
    const q = inputValue.trim();
    if (!q) return;
    if (activeTask) {
      setTaskThreads((prev) => ({
        ...prev,
        [activeTask.id]: [...(prev[activeTask.id] ?? []), { role: "user", text: q }, { role: "bot", text: taskReply(activeTask, q) }],
      }));
    } else {
      setGeneralAsked(true);
    }
    setInputValue("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="nb-modal-pop bg-white dark:bg-[#0E141F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[640px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-gradient-to-r from-blue-600 to-violet-600">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none">Copilot</div>
              <div className="text-[11px] text-white/75 mt-0.5">AI-prioritized critical path · deterministic CPM under the hood</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* CONVERSATION LIST */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/60 dark:bg-[#0B0F17]/60">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ongoing work..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                onClick={() => setActiveId(GENERAL_ID)}
                className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors ${
                  activeId === GENERAL_ID ? "bg-blue-500/10 border border-blue-500" : "border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">General Assistant</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500 truncate">Ask about any project</div>
                </div>
              </button>

              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-600 font-semibold px-2.5 pt-3 pb-1">
                Ongoing Work
              </div>
              {filteredTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openTask(t)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                    activeId === t.id ? "bg-blue-500/10 border border-blue-500" : "border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex justify-between items-center font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <span>{t.id}</span>
                    <span className="text-rose-600 dark:text-rose-400">{t.float}</span>
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">{t.name}</div>
                </button>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-500 text-center py-6">No work matches &quot;{query}&quot;.</div>
              )}
            </div>
          </div>

          {/* ACTIVE THREAD */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTask ? (
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{activeTask.id}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">{activeTask.name}</div>
              </div>
            ) : (
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">General Assistant</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">Chat natural query...</div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-[#0B0F17]">
              {activeTask
                ? (taskThreads[activeTask.id] ?? []).map((m, i) =>
                    m.role === "bot" ? (
                      <BotBubble key={i} text={m.text} />
                    ) : (
                      <UserBubble key={i} text={m.text} />
                    )
                  )
                : (
                  <>
                    <BotBubble text="Hi! Ask me about a delay, a cost impact, or the schedule risk on any active project." />
                    <UserBubble text="What happens if Floor 3 concrete pour is delayed 8 days?" />
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-slate-800 dark:text-slate-200 max-w-[85%] space-y-2">
                        <p>
                          Project end shifts Oct 14 → Oct 22 (+8d), budget risk ~€14,200. Recommended: crash Task #42
                          before Oct 18 rainfall.
                          {generalExpanded && (
                            <>
                              {" "}
                              This is driven by a 65% chance of 3 extra rainy days in the shifted window, on top of the
                              original supplier delay. The critical path now runs through Floor 3 stripping and Floor 4
                              rebar — both lose their float if this isn&apos;t crashed.
                            </>
                          )}
                        </p>
                        <button
                          onClick={() => setGeneralExpanded((v) => !v)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {generalExpanded ? "Show less" : "Read More"}
                          <ChevronDown className={`w-3 h-3 transition-transform ${generalExpanded ? "rotate-180" : ""}`} />
                        </button>
                        <button
                          onClick={handleViewAnalysis}
                          className="w-full flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                        >
                          <Waypoints className="w-3.5 h-3.5" /> View live CPM analysis
                        </button>
                      </div>
                    </div>
                    {generalAsked && (
                      <BotBubble text="Got it — for a deep dive on that, open the live CPM analysis above, or pick a specific activity on the left so I can pull its real float and status." />
                    )}
                  </>
                )}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0E141F] space-y-1.5">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus-within:border-violet-400">
                {!activeTask && (
                  <>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
                      <Smile className="w-4 h-4" />
                    </button>
                  </>
                )}
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={activeTask ? `Ask about ${activeTask.id}...` : "Ask Copilot..."}
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0"
                />
                <button onClick={send} className="text-violet-500 hover:text-violet-600 shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-600">
                Copilot can make mistakes. Verify important information before acting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shrink-0">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-slate-800 dark:text-slate-200 max-w-[85%]">
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 justify-end">
      <div className="bg-violet-500 text-white rounded-xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%]">{text}</div>
      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
        <User className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
