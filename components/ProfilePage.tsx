"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  BadgeCheck,
  Search,
  HardHat,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Sidebar from "./Sidebar";

interface CompanyInfo {
  name: string;
  taxId: string;
  industry: string;
  founded: string;
  headquarters: string;
  website: string;
  phone: string;
}

interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  employeeId: string;
  certifications: string[];
}

type SiteStatus = "Active" | "On Hold" | "Completed";

interface FieldSite {
  id: string;
  name: string;
  location: string;
  status: SiteStatus;
  progress: number;
  supervisor: string;
  workforce: number;
  startDate: string;
  targetCompletion: string;
}

type PersonnelStatus = "On Site" | "Off Site" | "On Leave";

interface Personnel {
  id: string;
  name: string;
  role: string;
  siteId: string;
  phone: string;
  status: PersonnelStatus;
}

const initialCompany: CompanyInfo = {
  name: "Meridian Construction Group",
  taxId: "TR-8842-119374",
  industry: "Commercial & Residential Construction",
  founded: "2011",
  headquarters: "Levent, Istanbul, Turkey",
  website: "www.meridianconstruction.com",
  phone: "+90 212 555 01 24",
};

const initialUser: UserProfile = {
  name: "John Doe",
  role: "Site Supervisor",
  email: "john.doe@meridianconstruction.com",
  phone: "+90 532 555 88 21",
  employeeId: "MCG-00142",
  certifications: ["OSHA 30", "PMP", "First Aid & CPR"],
};

const initialSites: FieldSite[] = [
  {
    id: "SITE-01",
    name: "Tower B — Riverside Complex",
    location: "Riverside District, Istanbul",
    status: "Active",
    progress: 62,
    supervisor: "John Doe",
    workforce: 84,
    startDate: "2025-03-10",
    targetCompletion: "2026-11-30",
  },
  {
    id: "SITE-02",
    name: "Meridian Business Park — Block C",
    location: "Maslak, Istanbul",
    status: "Active",
    progress: 38,
    supervisor: "Ayşe Kaya",
    workforce: 51,
    startDate: "2025-06-01",
    targetCompletion: "2027-02-15",
  },
  {
    id: "SITE-03",
    name: "Seaside Residences — Phase 2",
    location: "Bodrum, Muğla",
    status: "On Hold",
    progress: 21,
    supervisor: "Mehmet Yılmaz",
    workforce: 12,
    startDate: "2025-01-20",
    targetCompletion: "2026-08-01",
  },
];

const initialPersonnel: Personnel[] = [
  { id: "EMP-001", name: "John Doe", role: "Site Supervisor", siteId: "SITE-01", phone: "+90 532 555 88 21", status: "On Site" },
  { id: "EMP-002", name: "Ayşe Kaya", role: "Site Supervisor", siteId: "SITE-02", phone: "+90 532 555 44 09", status: "On Site" },
  { id: "EMP-003", name: "Mehmet Yılmaz", role: "Site Supervisor", siteId: "SITE-03", phone: "+90 532 555 12 67", status: "Off Site" },
  { id: "EMP-004", name: "Elif Şahin", role: "Safety Officer", siteId: "SITE-01", phone: "+90 532 555 33 40", status: "On Site" },
  { id: "EMP-005", name: "Kaan Demir", role: "Structural Engineer", siteId: "SITE-01", phone: "+90 532 555 76 12", status: "On Leave" },
  { id: "EMP-006", name: "Zeynep Arslan", role: "Foreman", siteId: "SITE-02", phone: "+90 532 555 90 03", status: "On Site" },
];

const statusStyles: Record<SiteStatus, string> = {
  Active: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
  "On Hold": "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
  Completed: "bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
};

const personnelStatusStyles: Record<PersonnelStatus, string> = {
  "On Site": "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
  "Off Site": "bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  "On Leave": "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
};

let siteCounter = initialSites.length + 1;
let personnelCounter = initialPersonnel.length + 1;

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const [company, setCompany] = useState<CompanyInfo>(initialCompany);
  const [companyDraft, setCompanyDraft] = useState<CompanyInfo>(initialCompany);
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  const [user, setUser] = useState<UserProfile>(initialUser);
  const [userDraft, setUserDraft] = useState<UserProfile>(initialUser);
  const [isEditingUser, setIsEditingUser] = useState(false);

  const [sites, setSites] = useState<FieldSite[]>(initialSites);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [newSite, setNewSite] = useState({ name: "", location: "", supervisor: "", workforce: "" });

  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", role: "", siteId: sites[0]?.id ?? "", phone: "" });
  const [personnelQuery, setPersonnelQuery] = useState("");

  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const flash = (msg: string) => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 2200);
  };

  const saveCompany = () => {
    setCompany(companyDraft);
    setIsEditingCompany(false);
    flash("Company profile saved");
  };
  const cancelCompany = () => {
    setCompanyDraft(company);
    setIsEditingCompany(false);
  };

  const saveUser = () => {
    setUser(userDraft);
    setIsEditingUser(false);
    flash("Profile saved");
  };
  const cancelUser = () => {
    setUserDraft(user);
    setIsEditingUser(false);
  };

  const addSite = () => {
    if (!newSite.name.trim() || !newSite.location.trim()) return;
    const id = `SITE-${String(siteCounter++).padStart(2, "0")}`;
    setSites((prev) => [
      ...prev,
      {
        id,
        name: newSite.name.trim(),
        location: newSite.location.trim(),
        status: "Active",
        progress: 0,
        supervisor: newSite.supervisor.trim() || "Unassigned",
        workforce: Number(newSite.workforce) || 0,
        startDate: new Date().toISOString().slice(0, 10),
        targetCompletion: "TBD",
      },
    ]);
    setNewSite({ name: "", location: "", supervisor: "", workforce: "" });
    setIsAddingSite(false);
    flash("Site added");
  };

  const removeSite = (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
    flash("Site removed");
  };

  const cycleSiteStatus = (id: string) => {
    const order: SiteStatus[] = ["Active", "On Hold", "Completed"];
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: order[(order.indexOf(s.status) + 1) % order.length] } : s))
    );
  };

  const addPerson = () => {
    if (!newPerson.name.trim() || !newPerson.role.trim()) return;
    const id = `EMP-${String(personnelCounter++).padStart(3, "0")}`;
    setPersonnel((prev) => [
      ...prev,
      {
        id,
        name: newPerson.name.trim(),
        role: newPerson.role.trim(),
        siteId: newPerson.siteId,
        phone: newPerson.phone.trim() || "—",
        status: "On Site",
      },
    ]);
    setNewPerson({ name: "", role: "", siteId: sites[0]?.id ?? "", phone: "" });
    setIsAddingPerson(false);
    flash("Personnel added");
  };

  const removePerson = (id: string) => {
    setPersonnel((prev) => prev.filter((p) => p.id !== id));
    flash("Personnel removed");
  };

  const filteredPersonnel = useMemo(() => {
    const q = personnelQuery.trim().toLowerCase();
    if (!q) return personnel;
    return personnel.filter(
      (p) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)
    );
  }, [personnel, personnelQuery]);

  const siteName = (id: string) => sites.find((s) => s.id === id)?.name ?? "Unassigned";

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E141F]/95 backdrop-blur px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
        <div className="flex items-center space-x-4">
          <Sidebar active="profile" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 hover:bg-slate-200/60 hover:dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-700 dark:text-slate-300">My Profile</h1>
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {savedFlash && (
        <div className="fixed top-20 right-6 z-30 bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-800 text-emerald-600 dark:text-emerald-300 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <BadgeCheck className="w-3.5 h-3.5" /> {savedFlash}
        </div>
      )}

      <main className="flex-1 overflow-y-auto max-w-6xl mx-auto px-4 lg:px-6 py-8 space-y-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MY PROFILE CARD */}
          <section className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Site Supervisor Profile
              </h2>
              {!isEditingUser ? (
                <button
                  onClick={() => setIsEditingUser(true)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-200/60 hover:dark:bg-slate-800/60"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={saveUser}
                    className="flex items-center gap-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-md"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={cancelUser} className="text-slate-500 dark:text-slate-500 hover:text-slate-700 hover:dark:text-slate-300 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 flex items-center justify-center text-xl font-bold text-slate-800 dark:text-slate-200 shrink-0">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0">
                {isEditingUser ? (
                  <input
                    value={userDraft.name}
                    onChange={(e) => setUserDraft({ ...userDraft, name: e.target.value })}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-base font-bold text-slate-900 dark:text-slate-100 w-full"
                  />
                ) : (
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                )}
                <div className="text-sm text-slate-500 dark:text-slate-500 font-mono mt-0.5">{user.employeeId}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <ProfileField
                label="Role"
                value={isEditingUser ? userDraft.role : user.role}
                editing={isEditingUser}
                onChange={(v) => setUserDraft({ ...userDraft, role: v })}
              />
              <ProfileField
                label="Email"
                value={isEditingUser ? userDraft.email : user.email}
                editing={isEditingUser}
                onChange={(v) => setUserDraft({ ...userDraft, email: v })}
                icon={<Mail className="w-3 h-3" />}
              />
              <ProfileField
                label="Phone"
                value={isEditingUser ? userDraft.phone : user.phone}
                editing={isEditingUser}
                onChange={(v) => setUserDraft({ ...userDraft, phone: v })}
                icon={<Phone className="w-3 h-3" />}
              />
              <ProfileField label="Assigned Site" value="Tower B — Riverside Complex" editing={false} onChange={() => {}} />
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold mb-1.5">Certifications</div>
              <div className="flex flex-wrap gap-1.5">
                {user.certifications.map((c) => (
                  <span
                    key={c}
                    className="text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* COMPANY INFO CARD */}
          <section className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Company Information
              </h2>
              {!isEditingCompany ? (
                <button
                  onClick={() => setIsEditingCompany(true)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-200/60 hover:dark:bg-slate-800/60"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={saveCompany}
                    className="flex items-center gap-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-md"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={cancelCompany} className="text-slate-500 dark:text-slate-500 hover:text-slate-700 hover:dark:text-slate-300 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {isEditingCompany ? (
              <input
                value={companyDraft.name}
                onChange={(e) => setCompanyDraft({ ...companyDraft, name: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-base font-bold text-slate-900 dark:text-slate-100 w-full"
              />
            ) : (
              <div className="font-bold text-slate-900 dark:text-slate-100">{company.name}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <ProfileField
                label="Tax / Registration No."
                value={isEditingCompany ? companyDraft.taxId : company.taxId}
                editing={isEditingCompany}
                onChange={(v) => setCompanyDraft({ ...companyDraft, taxId: v })}
              />
              <ProfileField
                label="Industry"
                value={isEditingCompany ? companyDraft.industry : company.industry}
                editing={isEditingCompany}
                onChange={(v) => setCompanyDraft({ ...companyDraft, industry: v })}
              />
              <ProfileField
                label="Founded"
                value={isEditingCompany ? companyDraft.founded : company.founded}
                editing={isEditingCompany}
                onChange={(v) => setCompanyDraft({ ...companyDraft, founded: v })}
              />
              <ProfileField
                label="Phone"
                value={isEditingCompany ? companyDraft.phone : company.phone}
                editing={isEditingCompany}
                onChange={(v) => setCompanyDraft({ ...companyDraft, phone: v })}
                icon={<Phone className="w-3 h-3" />}
              />
              <ProfileField
                label="Headquarters"
                value={isEditingCompany ? companyDraft.headquarters : company.headquarters}
                editing={isEditingCompany}
                onChange={(v) => setCompanyDraft({ ...companyDraft, headquarters: v })}
                icon={<MapPin className="w-3 h-3" />}
              />
              <ProfileField
                label="Website"
                value={isEditingCompany ? companyDraft.website : company.website}
                editing={isEditingCompany}
                onChange={(v) => setCompanyDraft({ ...companyDraft, website: v })}
                icon={<Globe className="w-3 h-3" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold">Active Sites</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{sites.filter((s) => s.status === "Active").length}</div>
              </div>
              <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold">Field Personnel</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{personnel.length}</div>
              </div>
            </div>
          </section>
        </div>

        {/* FIELD SITES / LOCATIONS */}
        <section className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Field Sites & Locations
            </h2>
            <button
              onClick={() => setIsAddingSite((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Add Site
            </button>
          </div>

          {isAddingSite && (
            <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                placeholder="Site name"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 sm:col-span-2"
              />
              <input
                placeholder="Location"
                value={newSite.location}
                onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
              <input
                placeholder="Supervisor"
                value={newSite.supervisor}
                onChange={(e) => setNewSite({ ...newSite, supervisor: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
              <input
                placeholder="Workforce #"
                value={newSite.workforce}
                onChange={(e) => setNewSite({ ...newSite, workforce: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
              <div className="sm:col-span-4 flex items-center gap-2 pt-1">
                <button onClick={addSite} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg">
                  Save Site
                </button>
                <button
                  onClick={() => setIsAddingSite(false)}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 hover:dark:bg-slate-800/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sites.map((site) => (
              <div key={site.id} className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">{site.name}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{site.location}</span>
                    </div>
                  </div>
                  <button onClick={() => removeSite(site.id)} className="text-slate-400 dark:text-slate-600 hover:text-rose-600 hover:dark:text-rose-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => cycleSiteStatus(site.id)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[site.status]}`}
                  title="Click to cycle status"
                >
                  {site.status}
                </button>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-500">
                    <span>Progress</span>
                    <span>{site.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${site.progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <div className="text-slate-500 dark:text-slate-500">Supervisor</div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold truncate">{site.supervisor}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Workforce
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold">{site.workforce}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-500">Start Date</div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold">{site.startDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-500">Target</div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold">{site.targetCompletion}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PERSONNEL */}
        <section className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Field Personnel
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={personnelQuery}
                  onChange={(e) => setPersonnelQuery(e.target.value)}
                  placeholder="Search name or role..."
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-7 pr-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 w-48"
                />
              </div>
              <button
                onClick={() => setIsAddingPerson((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Add Personnel
              </button>
            </div>
          </div>

          {isAddingPerson && (
            <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                placeholder="Full name"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
              <input
                placeholder="Role"
                value={newPerson.role}
                onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
              <select
                value={newPerson.siteId}
                onChange={(e) => setNewPerson({ ...newPerson, siteId: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Phone"
                value={newPerson.phone}
                onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
              <div className="sm:col-span-4 flex items-center gap-2 pt-1">
                <button onClick={addPerson} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg">
                  Save Personnel
                </button>
                <button
                  onClick={() => setIsAddingPerson(false)}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 hover:dark:bg-slate-800/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider">
                  <th className="font-semibold pb-2 pr-3">Name</th>
                  <th className="font-semibold pb-2 pr-3">Role</th>
                  <th className="font-semibold pb-2 pr-3">Site</th>
                  <th className="font-semibold pb-2 pr-3">Phone</th>
                  <th className="font-semibold pb-2 pr-3">Status</th>
                  <th className="font-semibold pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map((p) => (
                  <tr key={p.id} className="border-b border-slate-200/60 dark:border-slate-800/60 last:border-0">
                    <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="py-2.5 pr-3 text-slate-700 dark:text-slate-300">{p.role}</td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400 truncate max-w-[160px]">{siteName(p.siteId)}</td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400 font-mono">{p.phone}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${personnelStatusStyles[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => removePerson(p.id)} className="text-slate-400 dark:text-slate-600 hover:text-rose-600 hover:dark:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPersonnel.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 dark:text-slate-500">
                      No personnel match “{personnelQuery}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileField({
  label,
  value,
  editing,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold mb-1">{label}</div>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full"
        />
      ) : (
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
          {icon && <span className="text-slate-500 dark:text-slate-500">{icon}</span>}
          <span className="truncate">{value}</span>
        </div>
      )}
    </div>
  );
}
