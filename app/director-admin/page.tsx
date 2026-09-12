export const metadata = {
  title: "Ignite App",
};

export default function DirectorAdminPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: "clamp(1.25rem, 4.5vw, 1.75rem)",
            fontWeight: 700,
            color: "#C9002B",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Ignite App
        </h1>
        <div style={{ color: "#451a03", fontSize: "0.9rem", fontWeight: 500, marginTop: 6 }}>
          Ignite — booth, review queue, feed &amp; more
        </div>
      </div>

      {/* Embedded Ignite app */}
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(201,0,43,0.25)",
          boxShadow: "0 0 0 1px rgba(249,115,22,0.08)",
          background: "var(--card)",
        }}
      >
        <iframe
          src="https://ignite.abacusai.cloud"
          title="Ignite App"
          allow="clipboard-write; fullscreen; web-share"
          style={{ width: "100%", height: "82vh", border: 0, display: "block" }}
        />
      </div>

      {/* Helper */}
      <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 12 }}>
        Note: you may need to sign into Ignite once inside the panel above the first time you open it.
      </div>
    </div>
  );
}
