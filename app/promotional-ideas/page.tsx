"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PromotionalIdeaDetail {
  starts?: string;
  performance?: string;
  commitment?: string;
}

interface PromotionalIdea {
  id: string;
  name: string;
  icon: string;
  category: string;
  concept: string;
  format: string;
  distribution: string;
  integration?: string;
  copyrightSolution?: string;
  logoUrl?: string;
  details?: PromotionalIdeaDetail;
  flyerUrl?: string;
  status: string;
  approved: boolean;
  notes: string;
}

interface PartyConceptsData {
  promoIdeas?: PromotionalIdea[];
  promotionalIdeas?: PromotionalIdea[];
  lastUpdated: string;
}

export default function PromotionalIdeasPage() {
  const [data, setData] = useState<PartyConceptsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/party-concepts")
      .then((r) => r.json())
      .then((apiData) => {
        setData(apiData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>💡 Promotional Ideas</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const promotionalIdeas: PromotionalIdea[] = data.promoIdeas || data.promotionalIdeas || [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #c9002b, #ff4d6d)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          💡 Promotional Ideas
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Marketing strategies and promotional concepts for The Torch Boise
        </p>
      </div>

      {/* Ideas List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {promotionalIdeas.length === 0 && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, textAlign: "center", color: "var(--muted)" }}>
            No promotional ideas yet.
          </div>
        )}
        {promotionalIdeas.map((idea) => (
          <div
            key={idea.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            {/* Header Row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {idea.logoUrl ? (
                  <img
                    src={idea.logoUrl}
                    alt={`${idea.name} logo`}
                    style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, background: "#111" }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }}>{idea.icon}</span>
                )}
                <div>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
                    {idea.name}
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{idea.category}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: idea.approved
                      ? "rgba(0,168,107,0.15)"
                      : "rgba(255,193,7,0.2)",
                    color: idea.approved ? "#00a86b" : "#ffc107",
                  }}
                >
                  {idea.approved ? "✓ Approved" : "Pending"}
                </span>
                {idea.status && (
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "rgba(201,0,43,0.15)",
                      color: "var(--accent)",
                    }}
                  >
                    {idea.status}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                fontSize: "0.9rem",
              }}
            >
              <div>
                <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                  Concept
                </span>
                <span style={{ color: "var(--text)" }}>{idea.concept}</span>
              </div>
              <div>
                <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                  Format
                </span>
                <span style={{ color: "var(--text)" }}>{idea.format}</span>
              </div>
              {idea.distribution && (
                <div>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Distribution
                  </span>
                  <span style={{ color: "var(--text)" }}>{idea.distribution}</span>
                </div>
              )}
              {idea.integration && (
                <div>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Integration
                  </span>
                  <span style={{ color: "var(--text)" }}>{idea.integration}</span>
                </div>
              )}
              {idea.copyrightSolution && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    🛡️ Copyright / Legal Solution
                  </span>
                  <span style={{ color: "var(--text)" }}>{idea.copyrightSolution}</span>
                </div>
              )}
              {idea.details && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 8, fontSize: "0.8rem" }}>
                    📋 Event Details
                  </span>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {idea.details.starts && (
                      <div style={{ background: "rgba(201,0,43,0.08)", border: "1px solid rgba(201,0,43,0.3)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Starts</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{idea.details.starts}</div>
                      </div>
                    )}
                    {idea.details.performance && (
                      <div style={{ background: "rgba(201,0,43,0.08)", border: "1px solid rgba(201,0,43,0.3)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Performance</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{idea.details.performance}</div>
                      </div>
                    )}
                    {idea.details.commitment && (
                      <div style={{ background: "rgba(201,0,43,0.08)", border: "1px solid rgba(201,0,43,0.3)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Commitment</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{idea.details.commitment}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {idea.flyerUrl && (
                <div style={{ gridColumn: "span 2", marginTop: 8 }}>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 10, fontSize: "0.8rem" }}>
                    🪧 Official Flyer
                  </span>
                  <iframe
                    src={idea.flyerUrl}
                    style={{
                      width: "100%",
                      height: 700,
                      border: "1px solid rgba(201,0,43,0.35)",
                      borderRadius: 8,
                      background: "#080808",
                    }}
                    title="Flyer"
                  />
                  <a
                    href={idea.flyerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}
                  >
                    ↗ Open flyer full screen
                  </a>
                </div>
              )}
              {idea.notes && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Notes
                  </span>
                  <span style={{ color: "var(--text)" }}>
                    {idea.notes?.includes("http") ? (
                      <>
                        {idea.notes.split("https://")[0]}
                        <a
                          href={`https://${idea.notes.split("https://")[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--accent)", textDecoration: "underline" }}
                        >
                          https://{idea.notes.split("https://")[1]}
                        </a>
                      </>
                    ) : (
                      idea.notes
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated */}
      <p style={{ marginTop: 24, fontSize: "0.75rem", color: "var(--muted)", textAlign: "right" }}>
        Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Unknown"}
      </p>
    </div>
  );
}
