"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Sun,
  Moon,
  UploadCloud,
  ImagePlus,
  MapPin,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Pin,
  Box,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Sidebar from "./Sidebar";
import SamplePlanDrawing from "./SamplePlanDrawing";
import { PROJECTS, type Project } from "@/lib/projects";
import { computeCPM } from "@/lib/cpm";
import type { Pin3D } from "./Scene3DKit";

const LOADING_3D = <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Loading 3D view...</div>;

const Building3D = dynamic(() => import("./Building3D"), { ssr: false, loading: () => LOADING_3D });
const ResortVillage3D = dynamic(() => import("./ResortVillage3D"), { ssr: false, loading: () => LOADING_3D });
const PlazaTower3D = dynamic(() => import("./PlazaTower3D"), { ssr: false, loading: () => LOADING_3D });

const MODEL_3D_BY_PROJECT: Record<Project["id"], typeof Building3D> = {
  riverside: Building3D,
  resort: ResortVillage3D,
  plaza: PlazaTower3D,
};

interface Zone {
  id: string;
  taskId: string;
  xPct: number;
  yPct: number;
}

const steps = [
  { n: "01", title: "Upload your plan", body: "Drop in a drawing, floor plan or photo — or start from the sample." },
  { n: "02", title: "Drop activity pins", body: "Click anywhere on the drawing and link that spot to a schedule task." },
  { n: "03", title: "Spot the risk", body: "Pins on the critical path turn red automatically, computed live by the CPM engine." },
  { n: "04", title: "Share with the team", body: "Anyone on the project can open this view — no scheduling background needed." },
];

let zoneCounter = 1;

type PlanSource = "blueprint" | "photo" | "model3d" | "uploaded" | null;

export default function ConstructionPlansPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeProjectId, setActiveProjectId] = useState<Project["id"]>("riverside");
  const activeProject = PROJECTS.find((p) => p.id === activeProjectId) ?? PROJECTS[0];
  const [planSource, setPlanSource] = useState<PlanSource>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [pins3D, setPins3D] = useState<Pin3D[]>([]);
  const [placing, setPlacing] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<{ xPct: number; yPct: number } | null>(null);
  const [pending3DPoint, setPending3DPoint] = useState<[number, number, number] | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState(activeProject.tasks[0]?.id ?? "");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cpm = useMemo(() => computeCPM(activeProject.tasks), [activeProject]);
  const isCritical = (taskId: string) => cpm.tasks.find((t) => t.id === taskId)?.isCritical ?? false;
  const pinnedTaskIds = new Set([...zones.map((z) => z.taskId), ...pins3D.map((p) => p.taskId)]);
  const ActiveModel3D = MODEL_3D_BY_PROJECT[activeProject.id];

  const resetCanvas = () => {
    setUploadedUrl(null);
    setUploadedName(null);
    setZones([]);
    setPins3D([]);
    setSelectedTaskId(null);
    setViewMode("2d");
    setPlacing(false);
    setPendingPoint(null);
    setPending3DPoint(null);
  };

  const switchProject = (id: Project["id"]) => {
    if (id === activeProjectId) return;
    setActiveProjectId(id);
    setPlanSource(null);
    setPendingTaskId(PROJECTS.find((p) => p.id === id)?.tasks[0]?.id ?? "");
    resetCanvas();
  };

  const loadSample = (kind: "blueprint" | "photo" | "model3d") => {
    setPlanSource(kind);
    resetCanvas();
    if (kind === "model3d") setViewMode("3d");
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setUploadedUrl(url);
    setUploadedName(file.name);
    setPlanSource("uploaded");
    setZones([]);
    setPins3D([]);
    setSelectedTaskId(null);
    setViewMode("2d");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (!placing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPoint({ xPct, yPct });
  };

  const onPlace3D = (point: { x: number; y: number; z: number }) => {
    setPending3DPoint([point.x, point.y, point.z]);
  };

  const confirmPin = () => {
    if (!pendingTaskId) return;
    if (viewMode === "3d" && pending3DPoint) {
      setPins3D((prev) => [
        ...prev.filter((p) => p.taskId !== pendingTaskId),
        { id: `pin3d-${zoneCounter++}`, taskId: pendingTaskId, point: pending3DPoint },
      ]);
      setPending3DPoint(null);
    } else if (pendingPoint) {
      setZones((prev) => [
        ...prev.filter((z) => z.taskId !== pendingTaskId),
        { id: `zone-${zoneCounter++}`, taskId: pendingTaskId, xPct: pendingPoint.xPct, yPct: pendingPoint.yPct },
      ]);
      setPendingPoint(null);
    } else {
      return;
    }
    setPlacing(false);
    setSelectedTaskId(pendingTaskId);
  };

  const removeZone = (taskId: string) => {
    setZones((prev) => prev.filter((z) => z.taskId !== taskId));
    setPins3D((prev) => prev.filter((p) => p.taskId !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const hasPlan = planSource !== null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans antialiased">
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E141F]/95 backdrop-blur px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <Sidebar active="construction" />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 hover:bg-slate-200/60 hover:dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-700 dark:text-slate-300">Construction Plans</h1>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto max-w-6xl mx-auto px-4 lg:px-6 py-8 space-y-6 w-full">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Digital Twin — plan view</h2>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                LIVE
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-2xl">
              Bring any floor plan or site drawing in, pin it to the activities already tracked in the CPM engine, and see
              critical-path risk laid out spatially — built for anyone on the team, not just schedulers. Pin colors follow
              the engine in real time, so the plan always reflects where the current risk actually is.
            </p>
          </div>

          {/* PROJECT SELECTOR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROJECTS.map((p) => {
              const isActive = p.id === activeProject.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchProject(p.id)}
                  className={`text-left rounded-xl p-3.5 border transition-colors ${
                    isActive
                      ? "bg-blue-500/5 border-blue-500"
                      : "bg-white dark:bg-[#111826] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`text-sm font-bold ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-slate-100"}`}>
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{p.subtitle}</div>
                </button>
              );
            })}
          </div>

          {/* HOW IT WORKS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((s) => (
              <div key={s.n} className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center mb-2">
                  {s.n}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{s.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            {/* CANVAS */}
            <section className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              {!hasPlan ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="h-[420px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-center gap-3 px-6"
                >
                  <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Drag &amp; drop a plan, or choose a file</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">PNG or JPG — floor plans, site drawings, photos of printed sheets</div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-3.5 py-2 rounded-lg"
                    >
                      <ImagePlus className="w-4 h-4" /> Upload Plan
                    </button>
                    {activeProject.id === "riverside" ? (
                      <>
                        <button
                          onClick={() => loadSample("photo")}
                          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800"
                        >
                          Try a real floor plan
                        </button>
                        <button
                          onClick={() => loadSample("blueprint")}
                          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800"
                        >
                          Try a sample blueprint
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => loadSample("model3d")}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800"
                      >
                        <Box className="w-4 h-4" /> View 3D Model
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-600">
                    {activeProject.id === "riverside"
                      ? "Sample floor plan: Woodburn (Clemson Faculty Club), Library of Congress HABS collection — public domain"
                      : "Procedural 3D massing model — click any building, pool or plaza element to pin a schedule activity to it"}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {planSource === "blueprint" && "Riverside Tower B — Section A-A (sample blueprint)"}
                      {planSource === "photo" && "Woodburn, Clemson Faculty Club — Main Floor (public domain, Library of Congress HABS)"}
                      {planSource === "model3d" && `${activeProject.name} — procedural 3D model`}
                      {planSource === "uploaded" && uploadedName}
                    </div>
                    <div className="flex items-center gap-2">
                      {planSource === "blueprint" && (
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => {
                              setViewMode("2d");
                              setPending3DPoint(null);
                              setPlacing(false);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                              viewMode === "2d" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            <LayoutGrid className="w-3 h-3" /> 2D
                          </button>
                          <button
                            onClick={() => {
                              setViewMode("3d");
                              setPendingPoint(null);
                              setPlacing(false);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                              viewMode === "3d" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            <Box className="w-3 h-3" /> 3D
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setPlacing((v) => !v);
                          setPendingPoint(null);
                          setPending3DPoint(null);
                        }}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          placing
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" /> {placing ? (viewMode === "3d" ? "Click a surface..." : "Click the drawing...") : "Add Activity Pin"}
                      </button>
                      {activeProject.id === "riverside" && planSource !== "uploaded" && (
                        <button
                          onClick={() => loadSample(planSource === "photo" ? "blueprint" : "photo")}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Switch sample
                        </button>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Replace
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      />
                    </div>
                  </div>

                  {(planSource === "blueprint" && viewMode === "3d") || planSource === "model3d" ? (
                    <div className="relative h-[420px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                      <ActiveModel3D
                        pins={pins3D}
                        placing={placing}
                        selectedTaskId={selectedTaskId}
                        pendingPoint={pending3DPoint}
                        onPlace={onPlace3D}
                        onSelectPin={setSelectedTaskId}
                      />
                    </div>
                  ) : (
                  <div
                    ref={canvasRef}
                    onClick={onCanvasClick}
                    className={`relative h-[420px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 ${
                      placing ? "cursor-crosshair" : ""
                    }`}
                  >
                    {planSource === "blueprint" && <SamplePlanDrawing />}
                    {planSource === "photo" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/plans/sample-habs-floorplan.jpg"
                        alt="Woodburn, Clemson Faculty Club — Main Floor plan"
                        className="w-full h-full object-contain bg-white"
                      />
                    )}
                    {planSource === "uploaded" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={uploadedUrl ?? ""} alt="Uploaded construction plan" className="w-full h-full object-contain bg-slate-900" />
                    )}

                    {zones.map((z) => {
                      const task = activeProject.tasks.find((t) => t.id === z.taskId);
                      const critical = isCritical(z.taskId);
                      const active = selectedTaskId === z.taskId;
                      return (
                        <button
                          key={z.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskId(z.taskId);
                          }}
                          title={task?.name}
                          style={{ left: `${z.xPct}%`, top: `${z.yPct}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform ${
                            critical ? "bg-rose-500" : "bg-blue-500"
                          } ${active ? "scale-125 ring-4 ring-white/40" : "hover:scale-110"}`}
                        >
                          <Pin className="w-3 h-3 text-white" />
                        </button>
                      );
                    })}

                    {pendingPoint && (
                      <div
                        style={{ left: `${pendingPoint.xPct}%`, top: `${pendingPoint.yPct}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-dashed border-white bg-white/20 animate-pulse"
                      />
                    )}
                  </div>
                  )}

                  {(pendingPoint || pending3DPoint) && (
                    <div className="flex items-center gap-2 flex-wrap bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Link this spot to:</span>
                      <select
                        value={pendingTaskId}
                        onChange={(e) => setPendingTaskId(e.target.value)}
                        className="flex-1 min-w-[180px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
                      >
                        {activeProject.tasks.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id} · {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={confirmPin}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1.5 rounded-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Place pin
                      </button>
                      <button
                        onClick={() => {
                          setPendingPoint(null);
                          setPending3DPoint(null);
                          setPlacing(false);
                        }}
                        className="text-slate-400 dark:text-slate-600 hover:text-rose-600 hover:dark:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* LINKED ACTIVITIES */}
            <section className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 h-fit">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Linked Schedule Activities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Status comes straight from the CPM engine — red means zero float.
              </p>
              <div className="space-y-1.5">
                {activeProject.tasks.map((t) => {
                  const critical = isCritical(t.id);
                  const pinned = pinnedTaskIds.has(t.id);
                  const active = selectedTaskId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => pinned && setSelectedTaskId(t.id)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors ${
                        active
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F17]"
                      } ${pinned ? "cursor-pointer" : ""}`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${critical ? "bg-rose-500" : "bg-emerald-500"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-500">{t.id} · {t.duration}d {critical && "· critical"}</div>
                      </div>
                      {pinned ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeZone(t.id);
                          }}
                          className="text-slate-400 dark:text-slate-600 hover:text-rose-600 hover:dark:text-rose-400 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 shrink-0">Unpinned</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {hasPlan && zones.length === 0 && pins3D.length === 0 && (
                <div className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  No pins yet — click &quot;Add Activity Pin&quot; and tap the drawing to link your first task.
                </div>
              )}
            </section>
          </div>
        </main>
    </div>
  );
}
