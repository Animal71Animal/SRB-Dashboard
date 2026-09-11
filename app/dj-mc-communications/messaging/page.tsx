"use client";

import { useState, useEffect, useRef } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { type Role } from "@/lib/auth/roles";

export default function MessagingPage() {
  const [role, setRole] = useState<Role>("Employee");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMsgCountRef = useRef(0);

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
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    isNearBottomRef.current = isNearBottom;

    // Only auto-scroll if user is near bottom AND new messages arrived
    const newCount = messages.length;
    if (isNearBottom && newCount > prevMsgCountRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    prevMsgCountRef.current = newCount;
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/dj-mc-communications");
      const data = await res.json();
      setMessages(data.messages || []);
      setLoading(false);
    } catch {}
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch("/api/dj-mc-communications", {
      method: "POST",
      body: JSON.stringify({ sender: userName || email, text: newMessage }),
    });

    if (res.ok) {
      setNewMessage("");
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/dj-mc-communications?id=${id}`, { method: "DELETE" });
    fetchMessages();
  };

  // Only Admin (Eric) can delete
  const canDelete = role === "SuperAdmin";

  // Available reactions
  const REACTIONS = [
    { emoji: "❤️", label: "heart" },
    { emoji: "👍", label: "thumbsup" },
    { emoji: "🔥", label: "fire" },
    { emoji: "😂", label: "laugh" },
    { emoji: "👀", label: "eyes" },
  ];

  const handleReaction = async (msgId: string, reaction: string) => {
    const user = userName || email;
    await fetch("/api/dj-mc-communications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msgId, user, reaction }),
    });
    fetchMessages();
  };

  // Per-sender bubble colors (name match is case-insensitive)
  const SENDER_COLORS: Record<string, { bg: string; border: string; name: string }> = {
    animal:  { bg: "bg-purple-900/50", border: "border-purple-500/70", name: "text-purple-300" },
    steven:  { bg: "bg-amber-900/50",  border: "border-amber-700/70",  name: "text-amber-200"  },
    nico:    { bg: "bg-pink-900/50",   border: "border-pink-500/70",   name: "text-pink-300"   },
    star:    { bg: "bg-emerald-900/50",border: "border-emerald-500/70",name: "text-emerald-300"},
  };
  const DEFAULT_COLOR = { bg: "bg-zinc-900/80", border: "border-zinc-800", name: "text-gray-400" };
  const colorFor = (sender: string) =>
    SENDER_COLORS[sender.trim().toLowerCase()] || DEFAULT_COLOR;

  return (
    <div className="relative min-h-screen p-4 md:p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col h-[85vh]">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Messaging Board</h1>
        
        {/* Chat Feed */}
        <div
          ref={scrollRef}
          className="flex-1 bg-black/60 backdrop-blur-md border border-red-900/30 rounded-t-xl p-4 md:p-6 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-red-900"
        >
          {loading ? (
            <p className="text-gray-500 italic text-center mt-10">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 italic text-center mt-10">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender.toLowerCase() === email.toLowerCase();
              const c = colorFor(msg.sender);
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg border ${c.bg} ${c.border}`}>
                    <div className={`text-[0.65rem] mb-1 flex justify-between gap-4`}>
                      <span className={`font-bold ${c.name}`}>{msg.sender}</span>
                      <span className="text-gray-500">
                        {msg.date && msg.time
                          ? `${msg.date} • ${msg.time}`
                          : new Date(msg.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'America/Denver'
                            }).replace(',', ' •')
                        }
                      </span>
                    </div>
                    <div className="text-sm break-words">{msg.text}</div>
                  </div>
                  {/* Reactions row */}
                  <div className="flex items-center gap-1 mt-1">
                    {REACTIONS.map((r) => {
                      const count = (msg.reactions?.[r.label] || []).length;
                      const hasReacted = (msg.reactions?.[r.label] || []).includes(userName || email);
                      return (
                        <button
                          key={r.label}
                          onClick={() => handleReaction(msg.id, r.label)}
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs transition-colors ${
                            hasReacted
                              ? 'bg-red-900/40 text-red-300 border border-red-800/50'
                              : 'bg-black/40 text-gray-500 border border-zinc-800 hover:bg-zinc-800/60 hover:text-gray-300'
                          }`}
                          title={r.label}
                        >
                          <span>{r.emoji}</span>
                          {count > 0 && <span className="text-[0.65rem]">{count}</span>}
                        </button>
                      );
                    })}
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="text-[0.6rem] text-gray-600 hover:text-red-500 ml-2 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="bg-zinc-900/90 border-t border-red-900/30 p-4 rounded-b-xl">
          <form onSubmit={handleSend} className="flex gap-3">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-red-700 outline-none transition-colors"
            />
            <button 
              type="submit" 
              className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded font-bold text-sm transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
