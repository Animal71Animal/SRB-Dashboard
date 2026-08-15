"use client";

import { useState, useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { type Role } from "@/lib/auth/roles";

interface Entry {
  id: string;
  application: string;
  password: string;
}

interface PasswordData {
  torch1: Entry[];
  torch2: Entry[];
}

export default function PasswordsPage() {
  const [role, setRole] = useState<Role>("Employee");
  const [data, setData] = useState<PasswordData>({ torch1: [], torch2: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Flame Palette
  const torchRed = "#C9002B";
  const torchOrange = "#F97316";
  const torchBrown = "#451a03";

  useEffect(() => {
    const checkRole = async () => {
      const email = sessionStorage.getItem("srb-session-email") || "";
      const res = await fetch("/api/users");
      const d = await res.json();
      const matched = (d.users || []).find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) setRole(matched.role);
    };
    checkRole();
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("/api/passwords");
    const json = await res.json();
    setData({
      torch1: json.torch1 || [],
      torch2: json.torch2 || []
    });
    setLoading(false);
  };

  const isAdmin = role === "SuperSuperAdmin";

  const handleUpdate = (sheet: "torch1" | "torch2", id: string, field: keyof Entry, value: string) => {
    setData(prev => ({
      ...prev,
      [sheet]: prev[sheet].map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const addRow = (sheet: "torch1" | "torch2") => {
    const newEntry = { id: Date.now().toString(), application: "", password: "" };
    setData(prev => ({ ...prev, [sheet]: [...prev[sheet], newEntry] }));
  };

  const removeRow = (sheet: "torch1" | "torch2", id: string) => {
    setData(prev => ({ ...prev, [sheet]: prev[sheet].filter(p => p.id !== id) }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/passwords", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.ok) alert("All changes saved to GitHub.");
      else throw new Error();
    } catch (e) {
      alert("Failed to save.");
    }
    setSaving(false);
  };

  const renderSheet = (title: string, sheetKey: "torch1" | "torch2") => (
    <div className="flex-1 min-w-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: torchOrange }}>
          <span className="w-2 h-6 rounded-full" style={{ background: torchRed }}></span>
          {title}
        </h2>
        {isAdmin && (
          <button onClick={() => addRow(sheetKey)} className="text-[0.65rem] bg-zinc-900 hover:bg-orange-950/30 px-3 py-1 rounded border border-zinc-800 transition-colors uppercase font-bold tracking-widest text-orange-200">
            + Row
          </button>
        )}
      </div>
      <div className="bg-black/80 backdrop-blur-md border rounded-lg overflow-hidden" style={{ borderColor: `${torchBrown}55` }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-zinc-500 border-b font-bold uppercase tracking-widest" style={{ background: `${torchBrown}22`, borderColor: `${torchBrown}44` }}>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Password</th>
              {isAdmin && <th className="px-2 py-3 w-8"></th>}
            </tr>
          </thead>
          <tbody>
            {data[sheetKey].map((item) => (
              <tr key={item.id} className="border-b hover:bg-orange-950/10 transition-colors" style={{ borderColor: `${torchBrown}22` }}>
                <td className="px-4 py-2">
                  {isAdmin ? (
                    <input 
                      type="text" 
                      value={item.application}
                      onChange={(e) => handleUpdate(sheetKey, item.id, "application", e.target.value)}
                      className="bg-black/50 border border-zinc-800 rounded px-2 py-1 w-full focus:border-orange-700 outline-none text-zinc-300 transition-colors"
                    />
                  ) : (
                    <span className="text-zinc-300 font-medium">{item.application || "-"}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {isAdmin ? (
                    <input 
                      type="text" 
                      value={item.password}
                      onChange={(e) => handleUpdate(sheetKey, item.id, "password", e.target.value)}
                      className="bg-black/50 border border-zinc-800 rounded px-2 py-1 w-full focus:border-orange-700 outline-none text-zinc-300 font-mono transition-colors"
                    />
                  ) : (
                    <span className="text-zinc-400 font-mono bg-black/30 px-2 py-0.5 rounded select-all hover:text-white transition-colors">
                      {item.password || "-"}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-2 py-2">
                    <button onClick={() => removeRow(sheetKey, item.id)} className="text-zinc-700 hover:text-red-500 transition-colors">✕</button>
                  </td>
                )}
              </tr>
            ))}
            {data[sheetKey].length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 3 : 2} className="px-4 py-8 text-center text-zinc-700 italic">No entries in {title}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-zinc-800 pb-8 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <img 
                src="/images/torch-logo.png" 
                alt="The Torch" 
                className="h-24 object-contain transition-all duration-500"
                style={{ 
                  filter: "sepia(1) saturate(5) hue-rotate(-20deg) brightness(0.8) drop-shadow(0 0 10px #C9002B)" 
                }}
              />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter flex items-center gap-1">
                <span style={{ color: torchRed }}>TOC</span> 
                <span className="text-zinc-600 font-light">VAULT</span>
              </h1>
              <p className="text-zinc-500 text-xs mt-1 font-bold uppercase tracking-[0.2em]">Torch Operations Center Credential Hub</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={saveAll} 
              disabled={saving}
              className="hover:scale-105 active:scale-95 px-8 py-3 rounded-md font-black text-xs uppercase tracking-[0.2em] transition-all border shadow-lg disabled:opacity-50"
              style={{ background: torchRed, borderColor: torchOrange, boxShadow: `0 0 20px ${torchRed}44` }}
            >
              {saving ? "Deploying..." : "Sync Credentials"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-10">
          {loading ? (
            <div className="w-full text-center py-20 text-zinc-700 animate-pulse uppercase tracking-[0.3em] font-bold">Connecting to Vault...</div>
          ) : (
            <>
              {renderSheet("Torch 1", "torch1")}
              {renderSheet("Torch 2", "torch2")}
            </>
          )}
        </div>

        <div className="mt-20 pt-10 border-t border-zinc-900 flex justify-between items-center opacity-40">
           <div className="text-[0.6rem] font-bold text-zinc-600 tracking-[0.4em] uppercase">Private Internal Directory • WLP Dashboard</div>
           <div className="flex gap-4">
              <div className="w-3 h-3 rounded-full" style={{ background: torchRed }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: torchOrange }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: torchBrown }}></div>
           </div>
        </div>
      </div>

      <style jsx>{`
        input::placeholder { color: #222; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C9002B44; border-radius: 10px; }
      `}</style>
    </div>
  );
}
