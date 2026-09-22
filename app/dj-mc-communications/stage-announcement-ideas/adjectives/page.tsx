"use client";

import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

// The complete A to Z Stage Entertainer Adjective Compendium
const ADJECTIVES: Record<string, string[]> = {
  A: ["Alluring", "Amazing", "Astonishing", "Attractive", "Arresting", "Athletic", "Audacious", "Awe-inspiring", "Angelic", "Appetizing", "Admirable", "Absolute", "Aesthetic", "Artful", "Adorable"],
  B: ["Breathtaking", "Beautiful", "Bold", "Bewitching", "Blazing", "Beguiling", "Built", "Breathless", "Bright", "Brilliant", "Bewildering", "Blistering", "Beyond Compare", "Boss", "Bonita"],
  C: ["Captivating", "Chiseled", "Charismatic", "Charming", "Classy", "Cute", "Curvesome", "Celestial", "Cinematic", "Contoured", "Commanding", "Compelling", "Covetable", "Confident", "Chic"],
  D: ["Dazzling", "Divine", "Desirable", "Delicious", "Dynamic", "Dreamy", "Drop-Dead", "Dangerous", "Demure", "Daring", "Defiant", "Defined", "Demanding", "Divine", "Decadent"],
  E: ["Electric", "Enchanting", "Exquisite", "Empowered", "Elegant", "Erotic", "Ethereal", "Effortless", "Eye-Catching", "Electrifying", "Epic", "Expressive", "Extravagant", "Enthralling", "Ecstatic"],
  F: ["Flawless", "Fierce", "Fabulous", "Fantastic", "Fascinating", "Formidabile", "Fiery", "Feline", "First-Class", "Flashy", "Flirty", "Focused", "Form-Fitting", "Fresh"],
  G: ["Gorgeous", "Glamorous", "Glowing", "Golden", "Grand", "Gracious", "Gripping", "Groundbreaking", "Galvanizing", "Good-Looking", "Graceful", "Gleaming", "Great"],
  H: ["Hot", "Hypnotic", "Heavenly", "High-End", "High-Voltage", "Hypnotizing", "Heart-Stopping", "High-Class", "Handsome", "Haunting", "Head-Turning", "Heartwarming", "Heavenly-Looking", "Hyper-Attractive", "Hyper-Charged"],
  I: ["Irresistible", "Impeccable", "Incandescent", "Incomparable", "Incredible", "Intoxicating", "Infectious", "Inflammatory", "In-Demand", "Intense", "Invincible", "Inviting", "Illustrious", "Iconic", "Imposing"],
  J: ["Jaw-Dropping", "Juicy", "Jazzy", "Joyful", "Jaunty", "Jovial", "Jubilant", "Jewel-Like", "Juggernaut", "Joyous", "Jet-Set", "Juiced-Up", "Joy-Inducing", "Jazzy-Cool"],
  K: ["Knockout", "Killer", "Keen", "Kinky", "Kinetic", "Queenly", "Kissable", "Kickass", "Key", "Knockout-Gorgeous", "Kind", "Keen-Edged", "Kinetic-Charged", "Killer-Looking", "Knockout-Tier"],
  L: ["Luscious", "Lethal", "Luxurious", "Legendary", "Luminous", "Lustrous", "Limitless", "Lively", "Lovable", "Lovely", "Lit", "Lust-Worthy", "Magnetic", "Lush", "Laser-Focused"],
  M: ["Mesmerizing", "Magnificent", "Majestic", "Marvelous", "Masterful", "Mind-Blowing", "Model-Esque", "Mouthwatering", "Mystical", "Magnetic", "Memorable", "Mighty", "Modern", "Moody", "Maximalist"],
  N: ["Next-Level", "Nymph-Like", "Noticeable", "Nimble", "Neon", "Naughty", "Natural", "Nirvana-Esque", "Nonstop", "Numinous", "Note-Worthy", "Nimble-Footed", "Nocturnal", "Narcotic", "New-Age"],
  O: ["Outrageous", "Outstanding", "Over-The-Top", "Overwhelming", "Opulent", "Out-Of-This-World", "One-Of-A-Kind", "Overt", "Ostentatious", "Outspoken", "Overpowering", "On-Point", "Optimal", "Original", "Orbiting"],
  P: ["Perfect", "Phenomenal", "Powerful", "Provocative", "Pristine", "Polished", "Potent", "Preeminent", "Premium", "Prime", "Professional", "Pumping", "Pulsating", "Peerless", "Pure"],
  Q: ["Queenly", "Quirky", "Quintessential", "Quality", "Quantum", "Quietly-Devastating", "Quick", "Quick-Moving", "Quenched", "Quaking", "Quixotic", "Queen-Tier", "Quality-Made", "Quick-Paced", "Questionless"],
  R: ["Radiant", "Ravishing", "Reckless", "Red-Hot", "Refined", "Regal", "Relentless", "Remarkable", "Resplendent", "Rhythmic", "Riotous", "Robust", "Rock-Solid", "Rousing", "Roaring"],
  S: ["Stunning", "Sexy", "Sensational", "Sizzling", "Spectacular", "Striking", "Seductive", "Supreme", "Sultry", "Sculpted", "Smoldering", "Spellbinding", "Sophisticated", "Sinful", "Stellar"],
  T: ["Tempting", "Thrilling", "Top-Tier", "Tantalizing", "Terrific", "Transcendent", "Trim", "Toned", "Talented", "Tasteful", "Teasing", "Thunderous", "Timeless", "Total", "Transfixing"],
  U: ["Unstoppable", "Unbelievable", "Unforgettable", "Unmatched", "Unique", "Untamed", "Unrivaled", "Unreal", "Ultimate", "Urgent", "Ultra-Hot", "Uncompromising", "Uninhibited", "Unapologetic"],
  V: ["Vibrant", "Vixenish", "Visionary", "Voluptuous", "Versatile", "Vivid", "Victorious", "Vital", "Volcanic", "Velvet", "Venomous", "Value-Packed", "Vaulting", "Vibe-Heavy", "Virtuoso-Level"],
  W: ["Wild", "Wondrous", "World-Class", "Wicked", "Worship-Worthy", "Winning", "Wonderful", "Warm", "Welcoming", "Worthy", "Wow-Inducing", "Wavy", "Wide-Eyed", "Wise", "Witty"],
  X: ["X-Rated", "X-Ceptional", "X-Quisite", "X-Citing", "X-Otic", "X-Treme", "X-Posed", "X-Pressive", "X-Hilarating", "X-Factor", "X-Emplary", "X-Periential", "X-Enial", "X-Anthic", "X-Ray-Eyed"],
  Y: ["Youthful", "Yummy", "Yare", "Young", "Yielding", "Yoked", "Yellow-Hot", "Yummy-Looking", "Yearning", "Youth-Driven", "Year-Round", "Yonder-Reaching", "Youth-Focused", "Yes-Worthy", "Yare-Styled"],
  Z: ["Zesty", "Zippy", "Zingy", "Zenith-Level", "Zero-Gravity", "Zillion-Dollar", "Zealous", "Zestful", "Zone-Commanding", "Zen-Like", "Zoned-In", "Zero-Defect", "Zooming", "Zooted-Up", "Zenith-Bound"],
};

export default function AdjectivesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredAdjectives = Object.entries(ADJECTIVES).reduce((acc, [letter, list]) => {
    if (selectedLetter && letter !== selectedLetter) return acc;
    
    const filtered = list.filter((adj) =>
      adj.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length > 0) {
      acc[letter] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const totalCount = Object.values(ADJECTIVES).flat().length;

  return (
    <div className="relative min-h-screen p-4 md:p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
            ✨ Stage Adjectives
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
            The Torch 1 &amp; 2 • Master A to Z Stage Entertainer Vocabulary Compendium ({totalCount} words)
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              placeholder="Search adjectives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-red-700 outline-none transition-colors"
            />
            {(searchTerm || selectedLetter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLetter(null);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Letter shortcuts */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "center",
            paddingTop: 8,
            borderTop: "1px solid var(--border)"
          }}>
            {letters.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLetter(selectedLetter === l ? null : l)}
                style={{
                  width: 28,
                  height: 28,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  background: selectedLetter === l ? "var(--accent)" : "var(--bg)",
                  color: selectedLetter === l ? "#fff" : "var(--text)",
                  transition: "all 0.15s"
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Adjectives Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16
        }}>
          {Object.entries(filteredAdjectives).map(([letter, list]) => (
            <div
              key={letter}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--accent)",
                borderBottom: "1px solid var(--border)",
                paddingBottom: 8,
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>{letter}</span>
                <span style={{ fontSize: "0.80rem", color: "var(--muted)", fontWeight: 500 }}>
                  {list.length} words
                </span>
              </div>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8
              }}>
                {list.map((adj) => (
                  <span
                    key={adj}
                    style={{
                      background: "rgba(201, 0, 43, 0.05)",
                      border: "1px solid rgba(201, 0, 43, 0.15)",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: "0.825rem",
                      fontWeight: 500,
                      color: "var(--text)",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      if ("NDEFReader" in window || "speechSynthesis" in window) {
                        try {
                          const utterance = new SpeechSynthesisUtterance(adj);
                          utterance.rate = 0.9;
                          window.speechSynthesis.speak(utterance);
                        } catch (e) {}
                      }
                    }}
                    title="Click to hear pronunciation"
                  >
                    {adj}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(filteredAdjectives).length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
            No adjectives found matching your search.
          </div>
        )}

      </div>
    </div>
  );
}
