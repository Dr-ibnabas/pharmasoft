"use client";

// PHARMASOFT — Global error boundary (dernier filet de sécurité, hors layout).
// Doit déclarer html + body lui-même selon la convention Next.js.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#F8FAFC",
          display: "grid",
          placeItems: "center",
          fontFamily: "Inter, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              margin: "0 auto 16px",
              display: "grid",
              placeItems: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#FEE2E2",
              color: "#EF4444",
              fontSize: 32,
            }}
          >
            ⚠
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, color: "#0F172A" }}>Erreur critique</h1>
          <p style={{ margin: "0 0 24px", color: "#64748B" }}>
            L'application a rencontré une erreur inattendue.
            {error.digest ? <> Référence : <code>{error.digest}</code>.</> : null}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: 0,
              background: "#0EA5E9",
              color: "white",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
