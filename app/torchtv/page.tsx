"use client";

export default function TorchTVPage() {
  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "2rem" }}>📺</span>
            <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--accent)" }}>TorchTV — Master Broadcast</h1>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Live feed from Supercomputer</p>
            </div>
        </div>
      </div>

      {/* Main Player Area */}
      <div style={{ 
          flex: 1, 
          background: "#000", 
          borderRadius: 12, 
          overflow: "hidden", 
          border: "1px solid var(--border)", 
          position: "relative",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        {/* Using the direct watch URL in an iframe */}
        {/* Note: Requires 'Allowed Iframe Origins' set to https://srb-dashboard-tau.vercel.app on the abacus instance */}
        <iframe
          src="https://12b0afb612.abacusai.cloud/watch"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen"
        />
        
        {/* Overlay helper if connection is refused */}
        <div style={{ 
            position: "absolute", bottom: 20, right: 20, zIndex: 10,
            background: "rgba(0,0,0,0.7)", padding: "10px 16px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(4px)"
        }}>
            <a href="https://12b0afb612.abacusai.cloud/watch" target="_blank" rel="noopener noreferrer"
               style={{ color: "#fff", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
               <span>Launch in New Window</span>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
        </div>
      </div>
    </div>
  );
}
