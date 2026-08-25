"use client";

import { useState, useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { type Role, hasPermission } from "@/lib/auth/roles";

export default function SchedulingPage() {
  const [role, setRole] = useState<Role>("Employee");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentEmail = sessionStorage.getItem("srb-session-email") || "";
    setEmail(currentEmail);

    const checkRole = async () => {
      const res = await fetch("/api/users");
      const d = await res.json();
      const matched = (d.users || []).find((u: any) => u.email.toLowerCase() === currentEmail.toLowerCase());
      if (matched) {
        setRole(matched.role);
        setUserName(matched.name || matched.email);
      }
    };
    checkRole();
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await fetch("/api/scheduling");
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    await fetch("/api/scheduling", {
      method: "POST",
      body: JSON.stringify({ email: userName || email, date, reason }),
    });
    setDate("");
    setReason("");
    fetchRequests();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/scheduling?id=${id}`, { method: "DELETE" });
    fetchRequests();
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Time Off Requests</h1>
        
        {/* Request Form */}
        <div className="bg-black/60 backdrop-blur-md border border-red-900/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Request Time Off</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Target Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 p-2 rounded text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Notes / Reason (Optional)</label>
              <textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 p-2 rounded text-white h-20"
              />
            </div>
            <button type="submit" className="bg-red-700 hover:bg-red-600 p-2 rounded font-bold transition-colors">
              Submit Request
            </button>
          </form>
        </div>

        {/* List of Requests */}
        <div className="bg-black/60 backdrop-blur-md border border-red-900/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">All Time Off Requests</h2>
          <div className="flex flex-col gap-3">
            {requests.length === 0 ? (
              <p className="text-gray-500 italic">No pending requests.</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="flex justify-between items-center bg-zinc-900/50 p-4 rounded border border-zinc-800">
                  <div>
                    <div className="font-bold text-red-500">{new Date(req.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="text-sm text-gray-300">Requested by: <span className="text-white">{req.email}</span></div>
                    {req.reason && <div className="text-sm text-gray-400 mt-1 italic">"{req.reason}"</div>}
                  </div>
                  {(role === "Admin" || role === "Admin") && (
                    <button 
                      onClick={() => handleDelete(req.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
