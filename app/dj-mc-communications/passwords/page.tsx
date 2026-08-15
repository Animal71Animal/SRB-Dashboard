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
      alert("Failed to save. Check your connection or permissions.");
    }
    setSaving(false);
  };

  const renderSheet = (title: string, sheetKey: "torch1" | "torch2") => (
    <div className="flex-1 min-w-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#ff0080] flex items-center gap-2">
          <span className="w-2 h-6 bg-[#ff0080] rounded-full"></span>
          {title}
        </h2>
        {isAdmin && (
          <button onClick={() => addRow(sheetKey)} className="text-[0.65rem] bg-zinc-800 hover:bg-white/10 px-3 py-1 rounded border border-zinc-700 transition-colors uppercase font-bold tracking-widest">
            + Row
          </button>
        )}
      </div>
      <div className="bg-black/40 backdrop-blur-md border border-[#ff0080]/10 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#ff0080]/5 text-zinc-400 border-b border-[#ff0080]/10 font-bold uppercase tracking-widest">
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Password</th>
              {isAdmin && <th className="px-2 py-3 w-8"></th>}
            </tr>
          </thead>
          <tbody>
            {data[sheetKey].map((item) => (
              <tr key={item.id} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors">
                <td className="px-4 py-2">
                  {isAdmin ? (
                    <input 
                      type="text" 
                      value={item.application}
                      onChange={(e) => handleUpdate(sheetKey, item.id, "application", e.target.value)}
                      className="bg-black/50 border border-zinc-800 rounded px-2 py-1 w-full focus:border-[#ff0080] outline-none text-zinc-300 transition-colors"
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
                      className="bg-black/50 border border-zinc-800 rounded px-2 py-1 w-full focus:border-[#ff0080] outline-none text-zinc-300 font-mono transition-colors"
                    />
                  ) : (
                    <span className="text-zinc-400 font-mono bg-black/30 px-2 py-0.5 rounded select-all hover:text-white transition-colors">
                      {item.password || "-"}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-2 py-2">
                    <button onClick={() => removeRow(sheetKey, item.id)} className="text-zinc-600 hover:text-red-500 transition-colors">✕</button>
                  </td>
                )}
              </tr>
            ))}
            {data[sheetKey].length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 3 : 2} className="px-4 py-8 text-center text-zinc-600 italic">No entries listed in {title}</td>
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
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <span className="text-[#ff0080]">THE TORCH</span> 
              <span className="text-zinc-500 font-light">CREDENTIALS</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">Dual-property secure access directory.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={saveAll} 
              disabled={saving}
              className="bg-[#ff0080] hover:scale-105 active:scale-95 px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,0,128,0.3)] disabled:opacity-50"
            >
              {saving ? "Processing..." : "Sync to Repo"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-10">
          {loading ? (
            <div className="w-full text-center py-20 text-zinc-500 animate-pulse uppercase tracking-[0.3em] font-bold">Synchronizing...</div>
          ) : (
            <>
              {renderSheet("Torch 1", "torch1")}
              {renderSheet("Torch 2", "torch2")}
            </>
          )}
        </div>
        
        <div className="mt-16 flex flex-col items-center gap-4 opacity-20 hover:opacity-100 transition-opacity duration-700">
           <img 
             src="https://torch-dashboard-eight.vercel.app/images/torch-logo.png" 
             alt="Torch" 
             className="h-16"
             style={{ filter: "drop-shadow(0 0 15px #ff0080)" }}
           />
           <div className="text-[0.6rem] font-bold text-zinc-500 tracking-[0.4em] uppercase">Private Internal Directory</div>
        </div>
      </div>

      <style jsx>{`
        input::placeholder { color: #333; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ff008022; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #ff008044; }
      `}</style>
    </div>
  );
}
