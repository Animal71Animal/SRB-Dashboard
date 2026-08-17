"use client";

import { useEffect, useState } from "react";
import { type Role, hasPermission } from "@/lib/auth/roles";
import { ChevronDown, ChevronUp, Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface PromoItem {
  id: string;
  title: string;
  date: string;
  description: string;
  verbiage: string;
  drinkSpecials: string;
}

interface TorchSection {
  heavy: PromoItem[];
  upcoming: PromoItem[];
}

interface PromoData {
  torch1: TorchSection;
  torch2: TorchSection;
}

export default function PromotionalMaterialsPage() {
  const [data, setData] = useState<PromoData>({
    torch1: { heavy: [], upcoming: [] },
    torch2: { heavy: [], upcoming: [] }
  });
  const [role, setRole] = useState<Role>("Employee");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<PromoItem>>({});
  const [addingTo, setAddingTo] = useState<{ torch: 'torch1' | 'torch2', section: 'heavy' | 'upcoming' } | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const preview = sessionStorage.getItem("srb-role-preview");
      if (preview) { setRole(preview as Role); return; }
      const email = sessionStorage.getItem("srb-session-email");
      if (!email) return;
      const res = await fetch("/api/users");
      const d = await res.json();
      const matched = (d.users || []).find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) setRole(matched.role);
    };
    checkRole();
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("/api/promotional-materials");
    const json = await res.json();
    setData(json);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  const canEdit = role === "Admin" || role === "SuperAdmin";

  const handleSave = async (torch: 'torch1' | 'torch2', section: 'heavy' | 'upcoming', id?: string) => {
    if (id) {
      await fetch("/api/promotional-materials", {
        method: "PUT",
        body: JSON.stringify({ torch, section, id, update: editBuffer })
      });
      setEditingId(null);
    } else {
      await fetch("/api/promotional-materials", {
        method: "POST",
        body: JSON.stringify({ torch, section, item: editBuffer })
      });
      setAddingTo(null);
    }
    setEditBuffer({});
    fetchData();
  };

  const handleDelete = async (torch: string, section: string, id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/promotional-materials?torch=${torch}&section=${section}&id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const renderSection = (torch: 'torch1' | 'torch2', section: 'heavy' | 'upcoming', title: string) => {
    const items = data[torch][section];
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)" }}>{title}</h3>
          {canEdit && !addingTo && (
            <button 
              onClick={() => {
                setAddingTo({ torch, section });
                setEditBuffer({ title: "", date: "", description: "", verbiage: "", drinkSpecials: "" });
              }}
              style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Plus size={14} /> Add Event
            </button>
          )}
        </div>

        {addingTo?.torch === torch && addingTo?.section === section && (
          <div style={{ background: "var(--card)", border: "2px dashed var(--accent)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
             <input autoFocus placeholder="Event Title" style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", padding: "8px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }} value={editBuffer.title} onChange={e => setEditBuffer({...editBuffer, title: e.target.value})} />
             <input placeholder="Date" style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", padding: "8px 0", color: "var(--text)", marginBottom: 12 }} value={editBuffer.date} onChange={e => setEditBuffer({...editBuffer, date: e.target.value})} />
             <textarea placeholder="Description" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, padding: 8, color: "var(--text)", minHeight: 60, marginBottom: 12 }} value={editBuffer.description} onChange={e => setEditBuffer({...editBuffer, description: e.target.value})} />
             <textarea placeholder="Ideas for Verbiage" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, padding: 8, color: "var(--text)", minHeight: 60, marginBottom: 12 }} value={editBuffer.verbiage} onChange={e => setEditBuffer({...editBuffer, verbiage: e.target.value})} />
             <textarea placeholder="Drink Specials" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, padding: 8, color: "var(--text)", minHeight: 60, marginBottom: 12 }} value={editBuffer.drinkSpecials} onChange={e => setEditBuffer({...editBuffer, drinkSpecials: e.target.value})} />
             <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
               <button onClick={() => setAddingTo(null)} style={{ background: "var(--muted)", color: "white", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>Cancel</button>
               <button onClick={() => handleSave(torch, section)} style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>Save</button>
             </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.length === 0 && !addingTo && <div style={{ color: "var(--muted)", fontSize: "0.85rem", fontStyle: "italic" }}>No items scheduled.</div>}
          {items.map(item => {
            const isEditing = editingId === item.id;
            const isExpanded = expandedItems.has(item.id) || isEditing;

            return (
              <div key={item.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", transition: "all 0.15s" }}>
                <div 
                  onClick={() => !isEditing && toggleExpand(item.id)}
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                     <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{isEditing ? (
                        <input value={editBuffer.title} onChange={e => setEditBuffer({...editBuffer, title: e.target.value})} style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "inherit", fontWeight: "inherit", fontSize: "0.9em" }} onClick={e => e.stopPropagation()} />
                     ) : item.title}</div>
                     <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{isEditing ? (
                        <input value={editBuffer.date} onChange={e => setEditBuffer({...editBuffer, date: e.target.value})} style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "inherit", fontSize: "0.9em" }} onClick={e => e.stopPropagation()} />
                     ) : item.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {canEdit && (
                      <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSave(torch, section, item.id)} style={{ color: "#22c55e", background: "none", border: "none" }}><Check size={18} /></button>
                            <button onClick={() => setEditingId(null)} style={{ color: "var(--muted)", background: "none", border: "none" }}><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(item.id); setEditBuffer(item); }} style={{ color: "var(--muted)", background: "none", border: "none" }}><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(torch, section, item.id)} style={{ color: "#ef4444", background: "none", border: "none" }}><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    )}
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 0 }}>
                    <div style={{ paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                       <div>
                         <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Event Description</div>
                         {isEditing ? (
                           <textarea value={editBuffer.description} onChange={e => setEditBuffer({...editBuffer, description: e.target.value})} style={{ width: "100%", minHeight: 80, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "white", padding: 8, borderRadius: 6 }} />
                         ) : (
                           <div style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{item.description || "N/A"}</div>
                         )}
                       </div>
                       <div>
                         <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Drink Specials</div>
                         {isEditing ? (
                           <textarea value={editBuffer.drinkSpecials} onChange={e => setEditBuffer({...editBuffer, drinkSpecials: e.target.value})} style={{ width: "100%", minHeight: 80, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "white", padding: 8, borderRadius: 6 }} />
                         ) : (
                           <div style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{item.drinkSpecials || "N/A"}</div>
                         )}
                       </div>
                       <div style={{ gridColumn: "1 / -1" }}>
                         <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Verbiage Ideas</div>
                         {isEditing ? (
                           <textarea value={editBuffer.verbiage} onChange={e => setEditBuffer({...editBuffer, verbiage: e.target.value})} style={{ width: "100%", minHeight: 80, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "white", padding: 8, borderRadius: 6 }} />
                         ) : (
                           <div style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.15)", padding: 12, borderRadius: 8, borderLeft: "2px solid var(--accent)" }}>{item.verbiage || "N/A"}</div>
                         )}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 1.75rem)", fontWeight: 700, margin: 0 }}>Promotional Materials</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>Standardized Marketing · Visual & Verbal Consistency</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {/* Torch 1 Section */}
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ background: "var(--accent)", color: "white", padding: "4px 10px", borderRadius: 4, fontWeight: 800 }}>T1</div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Torch 1</h2>
           </div>
           {renderSection('torch1', 'heavy', 'Heavy Promotional Rotation')}
           {renderSection('torch1', 'upcoming', 'Upcoming Promotions')}
        </div>

        {/* Torch 2 Section */}
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ background: "var(--accent)", color: "white", padding: "4px 10px", borderRadius: 4, fontWeight: 800 }}>T2</div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Torch 2</h2>
           </div>
           {renderSection('torch2', 'heavy', 'Heavy Promotional Rotation')}
           {renderSection('torch2', 'upcoming', 'Upcoming Promotions')}
        </div>
      </div>
    </div>
  );
}
