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
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Base64
  const [imageFileName, setSelectedImageName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMsgCountRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-scroll: on initial load or when new messages arrive, snap to bottom
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const newCount = messages.length;
    if (newCount > prevMsgCountRef.current || prevMsgCountRef.current === 0) {
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
    if (!newMessage.trim() && !selectedImage) return;

    setLoading(true);
    let uploadedUrl = null;

    try {
      if (selectedImage && imageFileName) {
        setUploading(true);
        const upRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: selectedImage,
            fileName: imageFileName,
            prefix: "chat"
          })
        });
        const upJson = await upRes.json();
        if (upJson.ok) {
          uploadedUrl = upJson.url;
        } else {
          alert(`Image upload failed: ${upJson.error}`);
        }
      }

      const res = await fetch("/api/dj-mc-communications", {
        method: "POST",
        body: JSON.stringify({
          sender: userName || email,
          text: newMessage,
          imageUrl: uploadedUrl
        }),
      });

      if (res.ok) {
        setNewMessage("");
        setSelectedImage(null);
        setSelectedImageName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image size must be smaller than 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setSelectedImageName(file.name);
    };
    reader.readAsDataURL(file);
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
                    {msg.imageUrl && (
                      <div className="mt-2 max-w-xs md:max-w-md rounded overflow-hidden border border-zinc-800/80 bg-black/40">
                        <img 
                          src={msg.imageUrl} 
                          alt="Shared media" 
                          className="max-h-[300px] w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(msg.imageUrl, "_blank")}
                        />
                      </div>
                    )}
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
          {selectedImage && (
            <div className="mb-3 flex items-center gap-3 bg-black/40 border border-zinc-800 p-2 rounded max-w-sm">
              <img 
                src={selectedImage} 
                alt="Upload preview" 
                className="w-12 h-12 object-cover rounded border border-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 truncate">{imageFileName}</p>
                <p className="text-[0.65rem] text-red-500">Ready to upload</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedImageName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-gray-500 hover:text-red-500 p-1 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-3 items-end">
            <input 
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-zinc-800 hover:bg-zinc-700 text-gray-200 p-3 rounded font-bold text-sm transition-colors flex items-center justify-center min-h-[3rem] h-[3rem] w-[3rem] border border-zinc-700/50"
              title="Attach image"
              disabled={loading || uploading}
            >
              📷
            </button>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={5}
              className="flex-1 bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-red-700 outline-none transition-colors resize-none min-h-[7.5rem] max-h-[12rem] leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button 
              type="submit" 
              disabled={loading || uploading}
              className="bg-red-700 hover:bg-red-600 disabled:opacity-50 px-6 py-2 rounded font-bold text-sm transition-colors min-h-[3rem] h-[3rem]"
            >
              {uploading ? "Uploading..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
