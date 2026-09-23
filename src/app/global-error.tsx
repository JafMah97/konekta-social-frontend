"use client";

// Last resort when the root layout itself fails; no providers are available.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f5efe4", color: "#1b1712", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontWeight: 500 }}>Something broke</h1>
          <button onClick={reset} style={{ marginTop: 12, padding: "10px 20px", borderRadius: 999, border: 0, background: "#1b1712", color: "#f5efe4", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
