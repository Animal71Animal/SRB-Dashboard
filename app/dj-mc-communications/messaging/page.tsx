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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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

  // Only SuperSuperAdmin (Eric) can delete
  const canDelete = role === "SuperSuperAdmin";

  return (
    <div className="relative min-h-screen p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col h-[85vh]">
        <h1 className="text-4xl font-bold mb-4">Messaging Board</h1>
        
        {/* Chat Feed */}
        <div 
          ref={scrollRef}
          className="flex-1 bg-black/60 backdrop-blur-md border border-red-900/30 rounded-t-xl p-6 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-red-900"
        >
          {loading ? (
            <p className="text-gray-500 italic text-center mt-10">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 italic text-center mt-10">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender.toLowerCase() === email.toLowerCase();
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${isMe ? 'bg-red-900/40 border border-red-800/50' : 'bg-zinc-900/80 border border-zinc-800'}`}>
                    <div className="text-[0.65rem] text-gray-400 mb-1 flex justify-between gap-4">
                      <span>{msg.sender}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-sm break-words">{msg.text}</div>
                  </div>
                  {canDelete && (
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="text-[0.6rem] text-gray-600 hover:text-red-500 mt-1 transition-colors"
                    >
                      Delete
                    </button>
                  )}
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
