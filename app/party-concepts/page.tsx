"use client";

import { useEffect, useState } from "react";
import { useVenue } from "@/components/VenueSwitcher";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const SECTION_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly Special",
};

interface PartyConcept {
  id: string;
  name: string;
  icon: string;
  day: string;
  who: string;
  format: string;
  drinks: string;
  games: string;
  costuming: string;
  approved: boolean;
  flyerDone: boolean;
  flyerImage?: string;
  frequency?: string;
  startDate?: string;
  dates?: string[];
}

interface PromoIdea {
  id: string;
  name: string;
  icon: string;
  category: string;
  concept: string;
  format: string;
  distribution: string;
  status: string;
  approved: boolean;
  notes?: string;
  flyerUrl?: string;
  startDate?: string;
}

interface PartyConceptsFile {
  weekly: PartyConcept[];
  monthly: PartyConcept[];
  yearly: PartyConcept[];
  promoIdeas: PromoIdea[];
  lastUpdated: string;
}

const EMPTY: PartyConceptsFile = { weekly: [], monthly: [], yearly: [], promoIdeas: [], lastUpdated: "" };

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--bg)", color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", color: "var(--muted)", marginBottom: 4,
  textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600,
};

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function ConceptCard({ concept, section, onEdit }: { concept: PartyConcept; section: string; onEdit?: (c: PartyConcept) => void }) {
  const [expanded, setExpanded] = useState(false);
  const sortedDates = [...(concept.dates || [])].sort();
  const today = new Date().toISOString().split("T")[0];
  const next = sortedDates.find(d => d >= today) ?? sortedDates[0];
  const hasFlyer = !!concept.flyerImage;
  const textColor = hasFlyer ? "#fff" : "var(--text)";
  const mutedColor = hasFlyer ? "rgba(255,255,255,0.85)" : "var(--muted)";
  const borderColor = hasFlyer ? "rgba(255,255,255,0.2)" : "var(--border)";
  const cardStyle: React.CSSProperties = {
    ...CARD,
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    ...(hasFlyer ? {
      backgroundImage: `url(${concept.flyerImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: 220,
      border: "1px solid rgba(155,93,229,0.4)",
    } : {}),
  };
  return (
    <div style={cardStyle} onClick={() => setExpanded((v) => !v)}>
      {hasFlyer && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.82) 100%)",
          zIndex: 1,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: hasFlyer ? "#fff" : "var(--accent2)", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{concept.icon}</span>
          {concept.name}
        </h2>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, marginLeft: 8 }}>
          {concept.approved && (
            <span style={{ background: "rgba(0,168,107,0.15)", color: "#00a86b", padding: "3px 8px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 600 }}>
              ✓ Approved
            </span>
          )}
          <span style={{ background: "rgba(201,0,43,0.15)", color: hasFlyer ? "#ff8888" : "var(--accent)", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
            {concept.day}
          </span>
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(concept); }}
              style={{ background: "none", border: "1px solid var(--accent2)", color: "var(--accent2)", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", cursor: "pointer" }}>
              Edit
            </button>
          )}
          <span style={{ color: mutedColor, fontSize: "0.75rem" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {concept.startDate && (
        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: textColor, marginBottom: 8, lineHeight: 1.2 }}>
          {fmtDate(concept.startDate)}
        </div>
      )}
      {sortedDates.length > 0 && !concept.startDate && next && (
        <div style={{ fontSize: "0.82rem", color: mutedColor, marginBottom: 8 }}>{sortedDates.length} date(s) · next: {fmtDate(next)}</div>
      )}

      <p style={{ color: mutedColor, fontSize: "0.8rem", margin: "0 0 8px", fontStyle: "italic" }}>{concept.who}</p>
      <p style={{ color: textColor, fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>{concept.format}</p>

      {expanded && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${borderColor}`, paddingTop: 14 }}>
          {concept.drinks && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: mutedColor, marginBottom: 4 }}>🍹 Drinks</div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: textColor, lineHeight: 1.6 }}>{concept.drinks}</p>
            </div>
          )}
          {concept.games && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: mutedColor, marginBottom: 4 }}>🎮 Games & Activities</div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: textColor, lineHeight: 1.6 }}>{concept.games}</p>
            </div>
          )}
          {concept.costuming && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: mutedColor, marginBottom: 4 }}>👗 Costuming</div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: textColor, lineHeight: 1.6 }}>{concept.costuming}</p>
            </div>
          )}
          {sortedDates.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: mutedColor, marginBottom: 8 }}>📅 Scheduled Dates</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sortedDates.map(d => (
                  <span key={d} style={{ background: hasFlyer ? "rgba(255,255,255,0.1)" : "var(--bg)", border: `1px solid ${borderColor}`, borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", color: textColor }}>{fmtDate(d)}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 8, background: concept.approved ? "rgba(0,168,107,0.12)" : "rgba(180,180,180,0.12)", color: concept.approved ? "#00a86b" : mutedColor }}>
              {concept.approved ? "✓ Approved" : "⏳ Pending Approval"}
            </span>
            <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 8, background: concept.flyerDone ? "rgba(0,168,107,0.12)" : "rgba(180,180,180,0.12)", color: concept.flyerDone ? "#00a86b" : mutedColor }}>
              {concept.flyerDone ? "✓ Flyer Done" : "📋 Flyer Needed"}
            </span>
            <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 8, background: "rgba(100,100,255,0.1)", color: hasFlyer ? "#cca0ff" : "var(--accent2)" }}>
              {SECTION_LABEL[section] ?? section}
            </span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function PromoCard({ idea }: { idea: PromoIdea }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ ...CARD, cursor: "pointer" }} onClick={() => setExpanded((v) => !v)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--accent2)", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{idea.icon}</span>
          {idea.name}
        </h2>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, marginLeft: 8 }}>
          <span style={{
            background: idea.status === "Active" ? "rgba(0,168,107,0.15)" : "rgba(255,165,0,0.15)",
            color: idea.status === "Active" ? "#00a86b" : "#e8a020",
            padding: "3px 10px", borderRadius: 12, fontSize: "0.72rem", fontWeight: 600
          }}>
            {idea.status}
          </span>
          <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "0.72rem", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{idea.category}</p>
      <p style={{ color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>{idea.concept}</p>

      {expanded && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          {idea.format && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 4 }}>📋 Format</div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.6 }}>{idea.format}</p>
            </div>
          )}
          {idea.distribution && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 4 }}>📡 Distribution</div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.6 }}>{idea.distribution}</p>
            </div>
          )}
          {idea.notes && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 4 }}>📝 Notes</div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.6 }}>{idea.notes}</p>
            </div>
          )}
          {idea.flyerUrl && (
            <a href={idea.flyerUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 8, fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none", padding: "5px 12px", border: "1px solid var(--accent)", borderRadius: 8 }}
              onClick={(e) => e.stopPropagation()}>
              View Flyer →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const DAY_MAP: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

function generateWeeklyDates(startDate: string, dayName: string, endDate: string): string[] {
  const targetDay = DAY_MAP[(dayName || "").toLowerCase().trim()];
  if (targetDay === undefined || !startDate) return [];
  const end = new Date(endDate + "T12:00:00");
  const cur = new Date(startDate + "T12:00:00");
  while (cur.getDay() !== targetDay) cur.setDate(cur.getDate() + 1);
  const dates: string[] = [];
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 7);
  }
  return dates;
}

export default function PartyConceptsPage() {
  const [data, setData] = useState<PartyConceptsFile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [editConcept, setEditConcept] = useState<PartyConcept | null>(null);
  const [editForm, setEditForm] = useState<Partial<PartyConcept>>({});
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [genEndDate, setGenEndDate] = useState("2026-12-31");
  const [previewDates, setPreviewDates] = useState<string[] | null>(null);
  const venue = useVenue();

  const reload = () => fetch(`/api/party-concepts?venue=${venue}`).then(r => r.json()).then(d => setData(d ?? EMPTY)).catch(() => {});

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [venue]);

  const openEdit = (c: PartyConcept) => {
    setEditConcept(c);
    setEditForm({ ...c, dates: [...(c.dates || [])] });
    setNewDate("");
    setPreviewDates(null);
    setGenEndDate("2026-12-31");
  };

  const saveConcept = async () => {
    if (!editConcept) return;
    setSaving(true);
    try {
      const payload: any = { ...editForm };
      if (previewDates !== null) payload.dates = previewDates;
      // Keep current venue selection if user didn't pick one.
      if (!payload.venue) payload.venue = venue;
      await fetch("/api/party-concepts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "yearly", id: editConcept.id, ...payload }),
      });
      setEditConcept(null);
      setPreviewDates(null);
      await reload();
    } finally { setSaving(false); }
  };

  const removeDate = (d: string) => {
    setEditForm(f => ({ ...f, dates: (f.dates || []).filter(x => x !== d) }));
    setPreviewDates(null);
  };

  const addDate = () => {
    if (!newDate) return;
    const current = editForm.dates || [];
    if (!current.includes(newDate)) {
      setEditForm(f => ({ ...f, dates: [...(f.dates || []), newDate] }));
      setPreviewDates(null);
    }
    setNewDate("");
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
        Loading concept ideas...
      </div>
    );
  }

  const sections: Array<{ key: keyof Pick<PartyConceptsFile, "weekly" | "monthly" | "yearly">; label: string; emoji: string }> = [
    { key: "weekly", label: "Weekly Parties", emoji: "📅" },
    { key: "monthly", label: "Monthly Events", emoji: "🗓️" },
    { key: "yearly", label: "Yearly Specials", emoji: "⭐" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>💡 Concept Ideas</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
          Monthly event concepts and promotional ideas for The Torch Boise
          {data.lastUpdated && (
            <span style={{ marginLeft: 12, fontSize: "0.75rem" }}>
              · Updated {new Date(data.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </p>
      </div>

      {sections.map(({ key, label, emoji }) =>
        data[key]?.length > 0 ? (
          <div key={key} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <span>{emoji}</span> {label}
              <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400 }}>({data[key].length})</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {data[key].map((c) => (
                <ConceptCard key={c.id} concept={c} section={key} onEdit={key === "yearly" ? openEdit : undefined} />
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* ── Yearly Edit Modal ── */}
      {editConcept && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Edit: {editConcept.name}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={LABEL_STYLE}>Icon</label><input value={editForm.icon ?? ""} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} style={INPUT_STYLE} /></div>
                <div><label style={LABEL_STYLE}>Day / Occasion</label><input value={editForm.day ?? ""} onChange={e => setEditForm(f => ({ ...f, day: e.target.value }))} style={INPUT_STYLE} /></div>
              </div>
              <div><label style={LABEL_STYLE}>Name</label><input value={editForm.name ?? ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Target Audience</label><input value={editForm.who ?? ""} onChange={e => setEditForm(f => ({ ...f, who: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Format</label><textarea value={editForm.format ?? ""} onChange={e => setEditForm(f => ({ ...f, format: e.target.value }))} style={{ ...INPUT_STYLE, minHeight: 72, resize: "vertical" }} /></div>
              <div><label style={LABEL_STYLE}>Signature Drinks</label><input value={editForm.drinks ?? ""} onChange={e => setEditForm(f => ({ ...f, drinks: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Games & Activities</label><input value={editForm.games ?? ""} onChange={e => setEditForm(f => ({ ...f, games: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Costuming</label><input value={editForm.costuming ?? ""} onChange={e => setEditForm(f => ({ ...f, costuming: e.target.value }))} style={INPUT_STYLE} /></div>

              {/* ── Dates Section ── */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <p style={{ margin: "0 0 12px", fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>📅 Dates</p>

                {/* Start date + weekly generator */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                  <div><label style={LABEL_STYLE}>Start Date</label><input type="date" value={editForm.startDate ?? ""} onChange={e => { setEditForm(f => ({ ...f, startDate: e.target.value })); setPreviewDates(null); }} style={INPUT_STYLE} /></div>
                  <div><label style={LABEL_STYLE}>Generate Through</label><input type="date" value={genEndDate} onChange={e => { setGenEndDate(e.target.value); setPreviewDates(null); }} style={INPUT_STYLE} /></div>
                </div>
                <button type="button" onClick={() => setPreviewDates(generateWeeklyDates(editForm.startDate ?? "", editForm.day ?? "", genEndDate))}
                  style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
                  Generate Weekly Dates
                </button>
                {previewDates !== null && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ margin: "0 0 6px", fontSize: "0.78rem", color: "var(--muted)" }}>
                      {previewDates.length > 0 ? `${previewDates.length} dates — will replace existing on save:` : "⚠️ No dates generated. Check Start Date and Day fields."}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {previewDates.map(d => <span key={d} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: "0.75rem" }}>{fmtDate(d)}</span>)}
                    </div>
                  </div>
                )}

                {/* Add individual date */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ ...INPUT_STYLE, flex: 1 }} />
                  <button type="button" onClick={addDate}
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "8px 14px", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                    + Add Date
                  </button>
                </div>

                {/* Current dates */}
                {(editForm.dates || []).length > 0 && previewDates === null && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[...(editForm.dates || [])].sort().map(d => (
                      <span key={d} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
                        {fmtDate(d)}
                        <button onClick={() => removeDate(d)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem", padding: 0, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={saveConcept} disabled={saving}
                style={{ flex: 1, background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => { setEditConcept(null); setPreviewDates(null); }}
                style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "10px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {data.promoIdeas?.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span>💡</span> Promotional Ideas
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400 }}>({data.promoIdeas.length})</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {data.promoIdeas.map((p) => (
              <PromoCard key={p.id} idea={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
