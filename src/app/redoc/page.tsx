"use client";

import { useEffect, useState } from "react";

export default function RedocPage() {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRedoc = async () => {
      try {
        // Intenta primero con /api/redoc
        let response = await fetch("https://virtago-backend.vercel.app/api/redoc");
        
        if (!response.ok) {
          // Si falla, intenta con /redoc directo
          response = await fetch("https://virtago-backend.vercel.app/redoc");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (err) {
        console.error("Error cargando redoc:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchRedoc();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error al cargar la documentación</h1>
          <p className="text-slate-300 mb-4">No se pudo conectar con el backend:</p>
          <code className="block bg-slate-800 p-4 rounded text-red-400">{error}</code>
          <div className="mt-6 space-y-2 text-sm text-slate-400">
            <p>Verifica que el backend esté desplegado correctamente:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><a href="https://virtago-backend.vercel.app/redoc" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://virtago-backend.vercel.app/redoc</a></li>
              <li><a href="https://virtago-backend.vercel.app/api/redoc" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://virtago-backend.vercel.app/api/redoc</a></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-300">Cargando documentación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
