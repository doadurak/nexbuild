"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Bot, Waypoints, MousePointer2, UploadCloud, FileSpreadsheet, CheckCircle2, CloudRain, CloudSnow, Send, Paperclip, Smile, Sun, Moon } from "lucide-react";
import SplashSkyline from "./SplashSkyline";

const PlazaTower3D = dynamic(() => import("./PlazaTower3D"), { ssr: false, loading: () => null });

interface SceneDef {
  key: string;
  ms: number;
  light?: boolean;
  render: () => React.ReactNode;
}

const CPM_LOG = [
  "> Loading task graph — 7 nodes, 7 edges",
  "> Forward pass: computing Early Start / Early Finish...",
  "  T1  Site Mobilization & Permits        ES=0d  EF=3d",
  "  T3  Floor 3 Concrete Pour              ES=7d  EF=13d",
  "  T6  MEP Vertical Riser - Section B     ES=7d  EF=21d",
  "> Critical path: T1 → T2 → T3 → T4 → T5 → T7",
  "> Project duration: 32 days",
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`nb-promo-up text-lg font-extrabold tracking-[0.18em] uppercase mb-4 ${light ? "text-violet-600" : "text-violet-400"}`}>
      {children}
    </div>
  );
}

function Headline({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h1
      className={`nb-promo-up text-7xl md:text-8xl font-black tracking-tight leading-[1.03] ${light ? "text-slate-950" : "text-white"}`}
      style={{ animationDelay: "60ms" }}
    >
      {children}
    </h1>
  );
}

function ItHeadline({ prefix, light = false }: { prefix: string; light?: boolean }) {
  return (
    <h1
      className={`nb-promo-up text-8xl md:text-9xl font-black tracking-tight leading-[1.03] ${light ? "text-slate-950" : "text-white"}`}
      style={{ animationDelay: "60ms" }}
    >
      {prefix} <span className={light ? "text-violet-600" : "text-violet-400"}>it.</span>
    </h1>
  );
}

function Sub({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`nb-promo-up text-2xl mt-5 max-w-xl ${light ? "text-slate-500" : "text-slate-400"}`} style={{ animationDelay: "160ms" }}>
      {children}
    </p>
  );
}

function MockWindow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`nb-promo-up bg-[#120f1e] border border-violet-900/40 rounded-2xl shadow-2xl overflow-hidden ${className}`} style={{ animationDelay: "260ms" }}>
      {children}
    </div>
  );
}

/** Reveals `text` character by character — used everywhere we want a scene to feel "live" rather than a static screenshot. */
function Typewriter({ text, startDelay = 0, speed = 24, onDone }: { text: string; startDelay?: number; speed?: number; onDone?: () => void }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          onDone?.();
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{shown}</>;
}

const KINETIC_WORDS = ["Plan", "Track", "Build"];
const KINETIC_STEP = 1050;

/** Three rapid word-cuts, Bricka-style ("Type it. Tag it. Send it.") but for NexBuild. */
function KineticOpener() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= KINETIC_WORDS.length - 1) return;
    const t = setTimeout(() => setI((v) => v + 1), KINETIC_STEP);
    return () => clearTimeout(t);
  }, [i]);
  return (
    <div className="flex items-center justify-center w-full h-full">
      <h1 key={i} className="nb-promo-pop-scale text-8xl md:text-9xl font-black tracking-tight text-slate-950">
        {KINETIC_WORDS[i]} <span className="text-violet-600">it.</span>
        <span className="inline-block w-[8px] h-[0.8em] bg-violet-600 ml-3 align-middle nb-promo-cursor" />
      </h1>
    </div>
  );
}

/** Simulated cursor moves to where the real Copilot bubble lives, "clicks" it, the panel
 *  opens beside the copy (never over it), and a question is typed live. */
function LiveCopilotScene() {
  const [stage, setStage] = useState<"move" | "click" | "open" | "typing" | "sent" | "answered">("move");
  const question = "What if Floor 3 concrete pour slips 8 days?";

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage("click"), 700),
      setTimeout(() => setStage("open"), 900),
      setTimeout(() => setStage("typing"), 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6 w-full h-full">
      <div>
        <Eyebrow light>AI Copilot</Eyebrow>
        <Headline light>Ask anything, live.</Headline>
        <Sub light>Click the bubble, type a question, get an answer traced back to the real schedule.</Sub>
      </div>

      <div className="relative w-full h-[420px]">
        {/* simulated cursor */}
        <div
          className="absolute z-30 transition-all ease-in-out"
          style={{
            left: stage === "move" ? "40%" : "calc(100% - 70px)",
            top: stage === "move" ? "40%" : "calc(100% - 70px)",
            transitionDuration: "650ms",
          }}
        >
          <MousePointer2 className="w-9 h-9 text-slate-900 fill-violet-500 drop-shadow-lg" />
          {stage === "click" && <span className="absolute -inset-3 rounded-full bg-violet-400 nb-promo-ripple" />}
        </div>

        {/* the bubble itself */}
        {(stage === "move" || stage === "click") && (
          <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-violet-500 shadow-lg shadow-violet-500/40 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        )}

        {/* the opened panel — anchored bottom-right, never covers the copy on the left */}
        {(stage === "open" || stage === "typing" || stage === "sent" || stage === "answered") && (
          <div className="nb-promo-pop-scale absolute bottom-0 right-0 w-full max-w-md bg-[#120f1e] border border-violet-900/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-violet-700 to-fuchsia-600">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="font-bold text-lg text-white">Copilot</span>
            </div>
            <div className="p-5 min-h-[110px]">
              {stage === "answered" && (
                <div className="flex items-start gap-3 nb-promo-fade">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0">
                    <Bot className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="bg-[#1a1628] border border-violet-900/40 rounded-xl rounded-tl-sm px-4 py-3 text-base text-slate-100">
                    Project end shifts Oct 14 → Oct 22 (+8d), budget risk ~€14,200.
                    <span className="flex items-center gap-1.5 mt-2 text-sm font-semibold text-violet-300">
                      <Waypoints className="w-3.5 h-3.5" /> View live CPM analysis
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-violet-900/40 flex items-center gap-2.5">
              <div className="flex-1 flex items-center gap-2.5 bg-[#0B0F17] border border-violet-900/40 rounded-xl px-4 py-3">
                <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                <Smile className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="flex-1 text-base text-slate-100 text-left min-h-[1.25em]">
                  {stage === "typing" && (
                    <Typewriter
                      text={question}
                      speed={24}
                      onDone={() => {
                        setTimeout(() => setStage("sent"), 200);
                        setTimeout(() => setStage("answered"), 650);
                      }}
                    />
                  )}
                  {(stage === "sent" || stage === "answered") && question}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${stage === "sent" || stage === "answered" ? "bg-violet-500" : "bg-slate-800"}`}>
                <Send className={`w-[18px] h-[18px] ${stage === "sent" || stage === "answered" ? "text-white" : "text-slate-500"}`} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** A schedule file visibly dropping into the app and importing. */
function LiveUploadScene() {
  const [stage, setStage] = useState<"idle" | "drop" | "progress" | "done">("idle");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage("drop"), 400);
    const t2 = setTimeout(() => setStage("progress"), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (stage !== "progress") return;
    const start = Date.now();
    const id = setInterval(() => {
      const v = Math.min(100, Math.round(((Date.now() - start) / 1300) * 100));
      setPct(v);
      if (v >= 100) {
        clearInterval(id);
        setTimeout(() => setStage("done"), 150);
      }
    }, 40);
    return () => clearInterval(id);
  }, [stage]);

  return (
    <div className="flex flex-col items-center justify-center text-center w-full h-full px-6">
      <Eyebrow light>Import Any Schedule</Eyebrow>
      <ItHeadline prefix="Upload" light />
      <Sub light>Microsoft Project, Primavera, Excel — drop it in, keep working.</Sub>
      <div className="nb-promo-up mt-8 w-full max-w-md h-48 border-2 border-dashed border-violet-200 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden" style={{ animationDelay: "260ms" }}>
        {stage === "idle" && <UploadCloud className="w-12 h-12 text-slate-300" />}
        {(stage === "drop" || stage === "progress" || stage === "done") && (
          <div className="nb-promo-drop flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="text-base font-semibold text-slate-700">riverside-tower-b.xlsx</span>
          </div>
        )}
        {stage === "progress" && (
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-violet-500 rounded-full transition-[width] duration-100" style={{ width: `${pct}%` }} />
          </div>
        )}
        {stage === "done" && (
          <span className="nb-promo-fade flex items-center gap-1.5 text-base font-semibold text-emerald-600 mt-1">
            <CheckCircle2 className="w-[18px] h-[18px]" /> 7 tasks imported
          </span>
        )}
      </div>
    </div>
  );
}

function RainLayer() {
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-[2px] h-14 bg-gradient-to-b from-violet-200/0 to-violet-200/70 nb-promo-rain"
          style={{ left: `${(i * 7.3) % 100}%`, animationDuration: `${600 + (i % 5) * 70}ms`, animationDelay: `${(i % 9) * 80}ms` }}
        />
      ))}
    </>
  );
}

function SnowLayer() {
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-2.5 h-2.5 rounded-full bg-white/90 nb-promo-snow"
          style={{ left: `${(i * 9.1) % 100}%`, animationDuration: `${1700 + (i % 6) * 200}ms`, animationDelay: `${(i % 8) * 120}ms` }}
        />
      ))}
    </>
  );
}

/** Full-screen weather, not a boxed-in illustration — it should look like it's
 *  actually raining/snowing on the page itself. */
function WeatherRiskScene() {
  const [phase, setPhase] = useState<"rain" | "snow">("rain");
  useEffect(() => {
    const t = setTimeout(() => setPhase("snow"), 1700);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">{phase === "rain" ? <RainLayer /> : <SnowLayer />}</div>
      <div className="relative z-10">
        <Eyebrow>Weather Risk</Eyebrow>
        <Headline>Modeled, not guessed.</Headline>
        <Sub>Rain and snow probability feed straight into the schedule buffer.</Sub>
        <div className="nb-promo-up mt-7 inline-flex items-center gap-2.5 text-2xl font-bold text-white bg-black/50 backdrop-blur px-6 py-3 rounded-full border border-violet-900/50" style={{ animationDelay: "300ms" }}>
          {phase === "rain" ? <CloudRain className="w-7 h-7 text-violet-300" /> : <CloudSnow className="w-7 h-7 text-white" />}
          {phase === "rain" ? "Rain risk: +3 days buffer" : "Snow risk: +5 days buffer"}
        </div>
      </div>
    </div>
  );
}

const TASK_ROWS = [
  { id: "T2", name: "Floor 3 Rebar Inspection", critical: true },
  { id: "T3", name: "Floor 3 Concrete Pour", critical: true },
  { id: "T6", name: "MEP Vertical Riser - Section B", critical: false },
];

function Twin3DScene() {
  const [showInterface, setShowInterface] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowInterface(true), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6 w-full">
      <div>
        <Eyebrow>Digital Twin</Eyebrow>
        <Headline>Pin risk to the real plan.</Headline>
        <Sub>2D drawings or true 3D massing — click any zone, link it to the schedule.</Sub>
        {showInterface && (
          <div className="nb-promo-pop-scale mt-6 bg-[#120f1e] border border-violet-900/40 rounded-xl p-4 space-y-2 max-w-sm shadow-lg">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Linked Schedule Activities</div>
            {TASK_ROWS.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0B0F17] border border-violet-900/30">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.critical ? "bg-rose-500" : "bg-emerald-500"}`} />
                <span className="text-sm font-semibold text-slate-200 truncate">{t.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="nb-promo-up w-full max-w-md justify-self-center aspect-[4/3] rounded-2xl overflow-hidden border border-violet-900/40 shadow-2xl" style={{ animationDelay: "160ms" }}>
        <PlazaTower3D autoRotate hideChrome />
      </div>
    </div>
  );
}

interface ExplodeCard {
  label: string;
  sub: string;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  delay: number;
}

const EXPLODE_CARDS: ExplodeCard[] = [
  { label: "Dashboard", sub: "24 active projects", x: -300, y: -40, z: 20, rx: 8, ry: -20, delay: 0 },
  { label: "CPM Engine", sub: "Critical path: T1 → T2 → T3", x: -110, y: 10, z: 90, rx: 6, ry: -8, delay: 140 },
  { label: "Digital Twin", sub: "Floor 3 — critical", x: 90, y: -15, z: 160, rx: 4, ry: 8, delay: 280 },
  { label: "Scenario Explorer", sub: "22d · €905K", x: 290, y: 35, z: 230, rx: 2, ry: 20, delay: 420 },
];

/** Our real surfaces, fanned out in 3D — a "componentized" beat inspired by
 *  Bricka's exploded-card transition (flat, then rotated out on the Z axis). */
function ExplodedScene() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 150);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-6">
      <Eyebrow>One Real Engine</Eyebrow>
      <Headline>Every view, computed live.</Headline>
      <Sub>Dashboard, CPM console, digital twin, scenarios — same math, every time.</Sub>
      <div className="relative mt-20 w-full max-w-4xl h-52" style={{ perspective: "1400px" }}>
        {EXPLODE_CARDS.map((c) => (
          <div
            key={c.label}
            className={`absolute left-1/2 top-1/2 ${go ? "nb-promo-explode" : "opacity-0"}`}
            style={
              {
                "--tx": `${c.x}px`,
                "--ty": `${c.y}px`,
                "--tz": `${c.z}px`,
                "--rx": `${c.rx}deg`,
                "--ry": `${c.ry}deg`,
                animationDelay: `${c.delay}ms`,
                marginLeft: "-125px",
                marginTop: "-55px",
              } as React.CSSProperties
            }
          >
            <div className="w-[250px] bg-[#13101f] border border-violet-800/50 rounded-xl p-5 shadow-2xl text-left">
              <div className="text-lg font-bold text-white">{c.label}</div>
              <div className="text-sm text-violet-300 font-mono mt-1.5">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The actual pivot of the reel: starts light, then switches itself to dark
 *  mid-scene — a live demo of the real theme toggle, not just a claim. */
function ThemeToggleScene() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDark(true), 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 bg-[#050507] transition-opacity ease-in-out ${dark ? "opacity-100" : "opacity-0"}`} style={{ transitionDuration: "900ms" }} />
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-8xl md:text-9xl font-black tracking-tight">
          <span className={`transition-colors duration-700 ${dark ? "text-white" : "text-slate-950"}`}>Light</span>
          <span className="text-violet-500"> or dark.</span>
          <br />
          <span className={`transition-colors duration-700 ${dark ? "text-white" : "text-slate-950"}`}>Your call.</span>
        </h1>
        <p className={`nb-promo-up text-2xl mt-7 max-w-xl transition-colors duration-700 ${dark ? "text-slate-400" : "text-slate-500"}`} style={{ animationDelay: "200ms" }}>
          Every screen, every chart — built for both from day one.
        </p>
        <button
          type="button"
          className={`mt-10 w-24 h-12 rounded-full relative border transition-colors duration-700 ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
        >
          <span
            className="absolute top-1 w-10 h-10 rounded-full bg-violet-500 shadow-lg shadow-violet-500/40 flex items-center justify-center text-white transition-all duration-700 ease-in-out"
            style={{ left: dark ? "calc(100% - 44px)" : "4px" }}
          >
            {dark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </span>
        </button>
      </div>
    </div>
  );
}

const SCENES: SceneDef[] = [
  {
    key: "logo",
    ms: 2600,
    light: true,
    render: () => (
      <div className="relative flex items-center justify-center w-full h-full">
        <div className="absolute inset-x-0 bottom-[12%] flex justify-center pointer-events-none opacity-90">
          <SplashSkyline />
        </div>
        <div className="relative flex items-baseline text-[11rem] leading-none font-black tracking-tight">
          <span className="inline-block text-slate-950 nb-n-roll">N</span>
          <span className="text-slate-950 nb-rest-in" style={{ animationDelay: "100ms" }}>ex</span>
          <span className="text-slate-950 nb-rest-in" style={{ animationDelay: "170ms" }}>Build</span>
          <span className="text-violet-600 nb-rest-in" style={{ animationDelay: "240ms" }}>.ai</span>
        </div>
      </div>
    ),
  },
  { key: "kinetic", ms: 3400, light: true, render: () => <KineticOpener /> },
  {
    key: "deterministic",
    ms: 3300,
    light: true,
    render: () => (
      <div className="flex flex-col items-center justify-center text-center w-full h-full px-6">
        <h1 className="nb-promo-up text-7xl md:text-8xl font-black tracking-tight leading-[1.03]">
          <span className="text-slate-950">Deterministic math.</span>
          <br />
          <span className="text-slate-400">Not a black box.</span>
          <span className="inline-block w-[7px] h-[0.8em] bg-violet-600 ml-3 align-middle nb-promo-cursor" />
        </h1>
        <p className="nb-promo-up text-2xl text-slate-500 mt-7 max-w-2xl" style={{ animationDelay: "200ms" }}>
          A real forward/backward-pass Critical Path Method engine — every float, every date,
          traceable back to the math.
        </p>
      </div>
    ),
  },
  { key: "upload", ms: 3400, light: true, render: () => <LiveUploadScene /> },
  { key: "copilot-live", ms: 5200, light: true, render: () => <LiveCopilotScene /> },
  { key: "theme", ms: 4200, light: true, render: () => <ThemeToggleScene /> },
  {
    key: "console",
    ms: 3800,
    render: () => (
      <div className="flex flex-col items-center justify-center text-center w-full h-full px-6">
        <h1 className="nb-promo-up text-7xl md:text-8xl font-black tracking-tight text-white">
          See the math<span className="text-slate-600"> run live.</span>
        </h1>
        <div className="nb-promo-up mt-9 w-full max-w-3xl bg-[#0B0F17] border border-violet-900/40 rounded-2xl shadow-2xl p-6 text-left font-mono text-lg leading-relaxed" style={{ animationDelay: "260ms" }}>
          {CPM_LOG.map((line, i) => (
            <div
              key={i}
              className={`nb-promo-line whitespace-pre ${line.startsWith(">") ? "text-violet-400 font-semibold mt-1.5" : "text-slate-400"}`}
              style={{ animationDelay: `${400 + i * 220}ms` }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  { key: "twin3d", ms: 4800, render: () => <Twin3DScene /> },
  { key: "exploded", ms: 3600, render: () => <ExplodedScene /> },
  { key: "weather", ms: 3600, render: () => <WeatherRiskScene /> },
  {
    key: "scenarios",
    ms: 3800,
    render: () => (
      <div className="flex flex-col items-center justify-center text-center w-full h-full px-6">
        <Eyebrow>Scenario Explorer</Eyebrow>
        <Headline>Explore every outcome.</Headline>
        <MockWindow className="mt-8 w-full max-w-3xl p-6">
          <svg viewBox="0 0 560 220" className="w-full h-auto">
            <line x1="40" y1="10" x2="40" y2="190" stroke="#4c1d95" />
            <line x1="40" y1="190" x2="540" y2="190" stroke="#4c1d95" />
            {[
              { x: 70, y: 150, c: "#6d28d9", d: 400 },
              { x: 150, y: 120, c: "#7c3aed", d: 550 },
              { x: 230, y: 95, c: "#8b5cf6", d: 700 },
              { x: 330, y: 70, c: "#a855f7", d: 850 },
              { x: 430, y: 40, c: "#c084fc", d: 1000 },
              { x: 480, y: 100, c: "#d8b4fe", d: 1150 },
            ].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={11} fill={p.c} className="nb-promo-dot" style={{ animationDelay: `${p.d}ms` }} />
            ))}
          </svg>
          <div className="flex items-center justify-center gap-5 text-base font-semibold text-slate-400 mt-2">
            <span>Original Baseline · 32d · €1,088K</span>
            <span className="text-violet-900">|</span>
            <span>Crash Critical Path · 22d · €905K</span>
          </div>
        </MockWindow>
      </div>
    ),
  },
  {
    key: "outro",
    ms: 2600,
    render: () => (
      <div className="flex flex-col items-center justify-center text-center w-full h-full px-6">
        <div className="nb-promo-fade flex items-baseline text-8xl font-black tracking-tight">
          <span className="text-white">NexBuild</span>
          <span className="text-violet-400">.ai</span>
        </div>
        <p className="nb-promo-up text-xl font-semibold text-slate-400 mt-5 tracking-wide" style={{ animationDelay: "400ms" }}>
          CONSTRUCTION SCHEDULE ASSISTANT
        </p>
      </div>
    ),
  },
];

export default function PromoReel({ onDone }: { onDone?: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= SCENES.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setIndex((i) => i + 1), SCENES[index].ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const scene = SCENES[Math.min(index, SCENES.length - 1)];

  return (
    <div className={scene.light ? "" : "dark"}>
      <div className={`fixed inset-0 overflow-hidden ${scene.light ? "bg-white" : "bg-[#050507]"}`}>
        <div key={scene.key} className="w-full h-full flex items-center justify-center">
          {scene.render()}
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {SCENES.map((s, i) => (
            <span
              key={s.key}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-violet-400" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
