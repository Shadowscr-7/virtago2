export default function GeoBlockedPage() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>No disponible - Virtago</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#e2e8f0',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '48px 32px',
            maxWidth: '480px',
            borderRadius: '24px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              marginBottom: '16px',
            }}
          >
            🌎
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: '0 0 12px 0',
              background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Servicio no disponible
          </h1>
          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#94a3b8',
              margin: '0 0 24px 0',
            }}
          >
            Lo sentimos, Virtago actualmente solo está disponible en Uruguay.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '14px',
              color: '#a5b4fc',
            }}
          >
            🇺🇾 Disponible solo en Uruguay
          </div>
        </div>
      </body>
    </html>
  );
}
