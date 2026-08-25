"use client";

import Link from "next/link";
import { useState } from "react";

const ANNOUNCEMENTS = [
  "Next up, she's classy, sassy, and about to make your accountant nervous. Give it up for [Stage Name]!",
  "Coming to the stage, the woman who can make a grown man whisper, 'I can skip groceries this week.' Make some noise for [Stage Name]!",
  "Gentlemen, if you're feeling responsible tonight, don't worry - [Stage Name] is here to fix that!",
  "Coming to the stage, the reason your night just went from 'a couple drinks' to 'what the fuck happened last night?' Give it up for [Stage Name]!",
  "Gentlemen, if you came in here trying to be mature and responsible, we apologize in advance. Here comes [Stage Name]!",
  "Coming to the stage, the only woman who can make your credit card company call you just to check on your mental health. Make some noise for [Stage Name]!",
  "Coming to the stage, the woman who can make you forget your name, your age, and your safe-word. Give it up for [Stage Name]!",
  "She's beauty, she's grace, and she's about to put a massive smile on your face and a massive hole in your wallet. Welcome [Stage Name]!",
  "Coming to the stage is the woman who's about to make your wife's divorce lawyer very, very wealthy. Let's hear it for [Stage Name]!",
  "Coming to the stage is the woman who's about to make your heart rate go up and your credit score go down. Give it up for [Stage Name]!",
  "She's the reason your 'emergency fund' is about to become an 'emergency in and of itself.' Let's hear it for the stunning [Stage Name]!",
  "Here she comes, the woman of your dreams and your worst financial decisions. Show some love for [Stage Name]!",
  "If you're ready for a good time, look no further. Coming to the stage, the one and only [Stage Name]!",
  "Brace yourselves, 'cause [Stage Name] is about to make you forget your name, your age, and your budget!",
  "Coming to the stage is the woman you wish you could probably bring home to Mom and definitely dear old Dad! Give it up for [Stage Name]!",
  "Ladies and gentlemen, she's got all the right moves and she's about to show you every one of them. Give it up for [Stage Name]!",
  "Next up is a one-way ticket to trouble. Let's give a warm welcome to [Stage Name]!",
  "Brace yourselves - [Stage Name] is about to teach you what 'out of your league' really means!",
  "Coming up next, it's the reason you're gonna wish you went to the ATM first. Make some noise for [Stage Name]!",
  "Alright, time to welcome [Stage Name] the woman who'll have you promising things you can't afford!",
  "Coming to the stage, the woman you'll dream about and never afford [Stage Name]!",
  "Buckle up, because [Stage Name] is about to make your evening unforgettable... or at least hard to explain!",
  "Brace yourself for the woman who'll take your breath, your dignity, and possibly your last dollar!",
  "Coming up is the only woman who could make a priest reconsider! Hold onto your morals if you still have 'em for the irresistible [Stage Name]!",
  "Alright, guys, give it up for the woman who's gonna leave you broke, broken-hearted, and very, very confused. Let's welcome [Stage Name]!",
  "Coming up next, she's got moves that should be illegal in at least 13 states. Let's make it loud for the jaw-dropping [Stage Name]!",
  "Brace yourselves - [Stage Name] is about to put the 'hard' in hard-earned money!",
  "Next up, the nasty freak who'll have you thinking with the wrong head and spending with the wrong card. Welcome the filthy [Stage Name]!",
  "She's got curves, confidence, and a smile that says, 'Your rent can wait.' Give it up for [Stage Name]!",
  "She's got stage presence, confidence, and the ability to make bad decisions feel like self-care. Let's hear it for [Stage Name]!",
  "She's the reason the word 'miscellaneous' exists on your bank statement. Make some noise for [Stage Name]!",
  "She's got a body like a top-shelf whiskey - expensive, intoxicating, and guaranteed to make you talk crazy. Welcome [Stage Name]!",
  "Gentlemen, please check your pulse and your pockets, because [Stage Name] is about to take your breath and everything else you're carrying!",
  "Next up, she's all sass, all class, and she's about to school you about some ASS! Give it up for [Stage Name]!",
  "Hold onto your hats, wallets, and sanity 'cause [Stage Name] is coming in hot!",
  "She's got beauty, she's got brains, and she's got the moves to make you lose your mind. Let's hear it for [Stage Name]!",
  "Coming up, we've got the woman who'll make you rethink every life choice you've ever made. Give it up for [Stage Name]!",
  "She's got it all, and she's about to bring it all to the stage. Show your love for [Stage Name]!",
  "Next up is the reason you'll be Googling 'life advice' tomorrow. Make some noise for [Stage Name]!",
  "Heads up, gentlemen! [Stage Name] is here to make you question your priorities but don't worry, you'll love it!",
  "Hold tight! [Stage Name] is about to take you on a journey you'll lie about tomorrow.",
  "Alright, fellas, she's got more curves than a rollercoaster, and trust me this ride's worth every scream! Give it up for [Stage Name]!",
  "Get ready, 'cause this next performer's about to put you on a rollercoaster of bad decisions and every one of them is worth it! Make some noise for [Stage Name]!",
  "Next up, the woman who'll make you want to bury your face between her thighs and your entire paycheck in her G-string. Make some noise for [Stage Name]!",
];

export default function StageAnnouncementIdeasPage() {
  const [query, setQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filtered = ANNOUNCEMENTS.map((text, idx) => ({ text, index: idx + 1 })).filter((item) =>
    item.text.toLowerCase().includes(query.toLowerCase())
  );

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Link href="/dj-mc-communications" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.85rem" }}>
              ← DJ/MC Communications
            </Link>
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 1.85rem)", fontWeight: 800, margin: 0, color: "var(--text)" }}>
            🎙️ Stage Announcement Ideas
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 4 }}>
            The Torch 1 & 2 · Master MC Compendium for Dancer Stage Announcements
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/documents/stage-announcement-ideas.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
              padding: "10px 18px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.85rem",
              boxShadow: "0 2px 10px rgba(201,0,43,0.3)",
            }}
          >
            📄 Open Original PDF ↗
          </a>
          <a
            href="/documents/stage-announcement-ideas.pdf"
            download="Stage_Announcement_Ideas.pdf"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              textDecoration: "none",
              padding: "10px 18px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            ⬇ Download PDF
          </a>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <input
            type="text"
            placeholder="Search stage lines (e.g. wallet, rent, accountant, rollercoaster)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.3)",
              color: "var(--text)",
              fontSize: "0.95rem",
            }}
          />
        </div>
        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          Showing <strong>{filtered.length}</strong> of {ANNOUNCEMENTS.length} stage announcements
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 36 }}>
        {filtered.map((item) => (
          <div
            key={item.index}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
              <span
                style={{
                  color: "var(--accent2)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  minWidth: 32,
                  paddingTop: 2,
                }}
              >
                #{item.index}
              </span>
              <p style={{ margin: 0, color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                {item.text}
              </p>
            </div>
            <button
              onClick={() => copyText(item.text, item.index)}
              style={{
                background: copiedIndex === item.index ? "rgba(0,168,107,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${copiedIndex === item.index ? "#00a86b" : "var(--border)"}`,
                color: copiedIndex === item.index ? "#00a86b" : "var(--text)",
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {copiedIndex === item.index ? "✓ Copied" : "Copy Line"}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
