"use client";

export default function TorchTVPage() {
  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--accent)" }}>TorchTV — Master Broadcast</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Live feed + Admin Control Center</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20, flex: 1 }}>
        {/* Main Feed */}
        <div style={{ background: "#000", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", position: "relative" }}>
          <iframe
            src="https://12b0afb612.abacusai.cloud/watch"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; fullscreen"
          />
        </div>

        {/* Console / Side Control */}
        <div style={{ background: "var(--card)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Admin Console
            </div>
            <iframe
                src="https://12b0afb612.abacusai.cloud/admin"
                style={{ flex: 1, width: "100%", border: "none" }}
            />
        </div>
      </div>
    </div>
  );
}
