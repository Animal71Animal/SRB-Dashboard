"use client";

import { useState, useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { type Role } from "@/lib/auth/roles";

interface PasswordEntry {
  id: string;
  application: string;
  password: string;
}

export default function PasswordsPage() {
  const [role, setRole] = useState<Role>("Employee");
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
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
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    const res = await fetch("/api/passwords");
    const data = await res.json();
    setPasswords(data.passwords || []);
    setLoading(false);
  };

  const isAdmin = role === "SuperSuperAdmin";

  const handleUpdate = (id: string, field: keyof PasswordEntry, value: string) => {
    setPasswords(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addRow = () => {
    const newEntry = { id: Date.now().toString(), application: "", password: "" };
    setPasswords([...passwords, newEntry]);
  };

  const removeRow = (id: string) => {
    setPasswords(passwords.filter(p => p.id !== id));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await fetch("/api/passwords", {
        method: "POST",
        body: JSON.stringify({ passwords }),
      });
      alert("Passwords saved successfully.");
    } catch (e) {
      alert("Failed to save.");
    }
    setSaving(false);
  };

  return (
    <div className="relative min-h-screen p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-4">
              <span className="text-[#ff0080]">🔑</span> Passwords
            </h1>
            <p className="text-gray-400 mt-2">Internal application credential directory.</p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button onClick={addRow} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition-colors border border-zinc-700">
                + Add Row
              </button>
              <button 
                onClick={saveAll} 
                disabled={saving}
                className="bg-[#ff0080] hover:bg-[#e60073] px-6 py-2 rounded font-bold text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-[#ff0080]/20 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ff0080]/10 text-[#ff0080] text-xs uppercase tracking-widest border-b border-[#ff0080]/20">
                <th className="px-6 py-4 font-bold">Application Name</th>
                <th className="px-6 py-4 font-bold">Password</th>
                {isAdmin && <th className="px-6 py-4 font-bold w-20">Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 3 : 2} className="px-6 py-8 text-center text-gray-500 italic">
                    Loading credentials...
                  </td>
                </tr>
              ) : passwords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 3 : 2} className="px-6 py-8 text-center text-gray-500 italic">
                    No credentials logged.
                  </td>
                </tr>
              ) : (
                passwords.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      {isAdmin ? (
                        <input 
                          type="text" 
                          value={item.application}
                          onChange={(e) => handleUpdate(item.id, "application", e.target.value)}
                          className="bg-black/40 border border-zinc-800 rounded px-3 py-1.5 w-full text-sm focus:border-[#ff0080] outline-none transition-colors"
                        />
                      ) : (
                        <span className="text-sm font-medium">{item.application}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {isAdmin ? (
                        <input 
                          type="text" 
                          value={item.password}
                          onChange={(e) => handleUpdate(item.id, "password", e.target.value)}
                          className="bg-black/40 border border-zinc-800 rounded px-3 py-1.5 w-full text-sm focus:border-[#ff0080] outline-none transition-colors font-mono"
                        />
                      ) : (
                        <span className="text-sm font-mono bg-zinc-900 px-2 py-1 rounded select-all hover:bg-zinc-800 transition-colors">
                          {item.password}
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-3">
                        <button 
                          onClick={() => removeRow(item.id)}
                          className="text-gray-600 hover:text-red-500 transition-colors p-1"
                          title="Remove row"
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-center opacity-30 group hover:opacity-100 transition-opacity">
           <img 
             src="https://torch-dashboard-eight.vercel.app/images/torch-logo.png" 
             alt="Torch" 
             className="h-12 grayscale group-hover:grayscale-0 transition-all"
             style={{ filter: "drop-shadow(0 0 10px #ff0080)" }}
           />
        </div>
      </div>

      <style jsx>{`
        table { border-spacing: 0; }
        input::placeholder { color: #555; }
      `}</style>
    </div>
  );
}
