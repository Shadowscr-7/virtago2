"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Monitor,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Loader2,
  Terminal,
  SkipForward,
  Sparkles,
  X,
  Bug,
  Lightbulb,
  FileSearch,
  Code2,
  ShieldAlert,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";

// ─── Tipos ────────────────────────────────────────────────────────────────

interface TestFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
}

interface LogLine {
  id: number;
  text: string;
  type: "info" | "pass" | "fail" | "skip" | "error" | "system";
  timestamp: string;
}

interface RunConfig {
  file: string | null;
  project: string;
  headed: boolean;
  grep: string;
}

type RunStatus = "idle" | "loading" | "running" | "done";

interface TestFailure {
  id: number;
  testName: string;
  friendlyMessage: string;
  errorDetail: string;
  logContext: string;
  file?: string;
  line?: string;
}

interface AIAnalysis {
  cause: string;
  solution: string;
  severity: "critical" | "medium" | "low" | "config";
  file_hint?: string;
  code_suggestion?: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────

const ADMIN_EMAIL = "jcg.software.solution@gmail.com";

const PROJECTS = [
  { id: "chromium", label: "Chromium", icon: "🌐" },
  { id: "firefox", label: "Firefox", icon: "🦊" },
  { id: "webkit", label: "WebKit", icon: "🧭" },
];

// ─── Componente principal ────────────────────────────────────────────────

export default function TestRunnerPage() {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();

  // ── Estado ──────────────────────────────────────────────────────────────
  const [tests, setTests] = useState<TestFile[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [config, setConfig] = useState<RunConfig>({
    file: null,
    project: "chromium",
    headed: false,
    grep: "",
  });
  const [stats, setStats] = useState({ pass: 0, fail: 0, skip: 0, total: 0 });
  const [showConfig, setShowConfig] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [failures, setFailures] = useState<TestFailure[]>([]);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisTestName, setAnalysisTestName] = useState("");

  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lineIdRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failureIdRef = useRef(0);

  // ── Verificar admin ─────────────────────────────────────────────────────
  const isAdmin = user?.email === ADMIN_EMAIL;

  // ── Auto-scroll logs ───────────────────────────────────────────────────
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // ── Cargar lista de tests ──────────────────────────────────────────────
  const loadTests = useCallback(async () => {
    try {
      const res = await fetch("/api/tests");
      const data = await res.json();
      if (data.success) {
        setTests(data.tests);
      }
    } catch (err) {
      console.error("Error cargando tests:", err);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadTests();
  }, [isAdmin, loadTests]);

  // ── Timer ──────────────────────────────────────────────────────────────
  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ── Agregar línea al log ──────────────────────────────────────────────
  const addLog = (text: string, type: LogLine["type"] = "info") => {
    const line: LogLine = {
      id: ++lineIdRef.current,
      text,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [...prev, line]);

    // Actualizar stats
    if (type === "pass") setStats((s) => ({ ...s, pass: s.pass + 1, total: s.total + 1 }));
    if (type === "fail") setStats((s) => ({ ...s, fail: s.fail + 1, total: s.total + 1 }));
    if (type === "skip") setStats((s) => ({ ...s, skip: s.skip + 1, total: s.total + 1 }));
  };

  // ── Ejecutar tests ────────────────────────────────────────────────────
  const runTests = async () => {
    // Reset estado
    setLogs([]);
    setStats({ pass: 0, fail: 0, skip: 0, total: 0 });
    setExitCode(null);
    setStatus("loading");
    setFailures([]);
    lineIdRef.current = 0;
    failureIdRef.current = 0;

    const abort = new AbortController();
    abortRef.current = abort;

    const payload: Record<string, unknown> = {
      project: config.project,
      headed: config.headed,
    };
    if (config.file) payload.file = config.file;
    if (config.grep) payload.grep = config.grep;

    addLog(
      `▶ Iniciando tests ${config.file || "(todos)"} en ${config.project}${config.headed ? " (headed)" : ""}`,
      "system"
    );

    try {
      const res = await fetch("/api/tests/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        addLog(`✗ Error HTTP ${res.status}: ${res.statusText}`, "error");
        setStatus("done");
        return;
      }

      setStatus("running");
      startTimer();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parsear SSE events del buffer
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const eventMatch = part.match(/^event:\s*(.+)$/m);
          const dataMatch = part.match(/^data:\s*(.+)$/m);

          if (!dataMatch) continue;

          const eventType = eventMatch?.[1] || "message";
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(dataMatch[1]);
          } catch {
            continue;
          }

          switch (eventType) {
            case "start":
              addLog(`⚡ Comando: ${data.command}`, "system");
              break;

            case "output": {
              const text = data.text as string;
              const lineType = data.type as LogLine["type"];
              addLog(text, lineType);
              break;
            }

            case "error":
              addLog(`⚠ ${data.message}`, "error");
              break;

            case "done": {
              const code = data.exitCode as number;
              setExitCode(code);
              addLog(
                code === 0
                  ? "✓ Tests completados exitosamente"
                  : `✗ Tests terminaron con código ${code}`,
                code === 0 ? "pass" : "fail"
              );
              break;
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        addLog("■ Ejecución cancelada por el usuario", "system");
      } else {
        addLog(`✗ Error: ${err instanceof Error ? err.message : "desconocido"}`, "error");
      }
    } finally {
      stopTimer();
      setStatus("done");
      abortRef.current = null;
    }
  };

  // ── Detener tests ─────────────────────────────────────────────────────
  const stopTests = async () => {
    // 1. Primero pedir al servidor que mate el proceso de Playwright
    try {
      await fetch("/api/tests/stop", { method: "POST" });
    } catch {
      // Si falla, al menos cerramos el stream
    }
    // 2. Abortar el stream SSE del lado del cliente
    abortRef.current?.abort();
    stopTimer();
    addLog("■ Ejecución detenida por el usuario", "system");
    setStatus("done");
  };

  // ── Limpiar consola ───────────────────────────────────────────────────
  const clearLogs = () => {
    setLogs([]);
    setStats({ pass: 0, fail: 0, skip: 0, total: 0 });
    setExitCode(null);
    setStatus("idle");
    setElapsed(0);
    setFailures([]);
  };

  // ── Extraer failures de los logs ──────────────────────────────────────
  const extractFailures = useCallback((allLogs: LogLine[]): TestFailure[] => {
    const found: TestFailure[] = [];
    let currentTestName = "";
    let currentFile = "";

    for (let i = 0; i < allLogs.length; i++) {
      const line = allLogs[i];
      const text = line.text;

      // Detectar nombre de test: "✗ 24 [chromium] > tests\register.spec.ts:145:7 > Register Flow > should capture console errors"
      // O variantes: "✕ ...", "✘ ...", "X ..." con corchetes de browser
      const failLineMatch = text.match(
        /[✗✘✕×❌]\s*\d*\s*\[(\w+)\]\s*›?\s*(.+?\.spec\.ts(?::[\d]+)?)\s*›?\s*(.+)/i
      );
      if (failLineMatch) {
        currentFile = failLineMatch[2].trim();
        currentTestName = failLineMatch[3]
          .replace(/›/g, ">")
          .replace(/\s*\([\d.]+[ms]+\)\s*$/, "")
          .trim();
      }

      // También detectar líneas tipo "X [chromium]" sin emoji
      const failLineAlt = text.match(
        /^\s*X\s+\d+\s*\[(\w+)\]\s*›?\s*(.+?\.spec\.ts(?::[\d]+)?)\s*›?\s*(.+)/i
      );
      if (failLineAlt && !failLineMatch) {
        currentFile = failLineAlt[2].trim();
        currentTestName = failLineAlt[3]
          .replace(/›/g, ">")
          .replace(/\s*\([\d.]+[ms]+\)\s*$/, "")
          .trim();
      }

      // Cuando detectamos un fail con nombre, recoger contexto
      if (line.type === "fail" && (failLineMatch || failLineAlt)) {
        // Recoger líneas de contexto (10 líneas antes y después)
        const contextStart = Math.max(0, i - 5);
        const contextEnd = Math.min(allLogs.length - 1, i + 15);
        const contextLines = allLogs
          .slice(contextStart, contextEnd + 1)
          .map((l) => l.text)
          .join("\n");

        // Buscar la línea de error específica después (timeout, expect, etc.)
        let errorDetail = "";
        for (let j = i + 1; j < Math.min(i + 20, allLogs.length); j++) {
          const errText = allLogs[j].text;
          if (
            errText.includes("Timeout") ||
            errText.includes("expect(") ||
            errText.includes("Error:") ||
            errText.includes("error:") ||
            errText.includes("waiting for") ||
            errText.includes("429") ||
            errText.includes("500") ||
            errText.includes("failed") ||
            errText.includes("ECONNREFUSED")
          ) {
            errorDetail += errText + "\n";
          }
          // Stop at next test or at summary
          if (errText.match(/[✓✔✗✘✕]\s*\d/) || errText.includes("══")) break;
        }

        // Crear mensaje amigable
        const friendly = generateFriendlyMessage(currentTestName, errorDetail || text);

        found.push({
          id: ++failureIdRef.current,
          testName: currentTestName || text.substring(0, 80),
          friendlyMessage: friendly,
          errorDetail: errorDetail || text,
          logContext: contextLines,
          file: currentFile || undefined,
        });
      }

      // Líneas de error que llegan como tipo "error" con patrón de test fallido
      if (
        line.type === "error" &&
        (text.includes("ERRORS") || text.includes("Failed to load resource"))
      ) {
        // Buscar si ya capturamos este error como parte de un test
        const alreadyCaptured = found.some(
          (f) => f.errorDetail.includes(text.substring(0, 50))
        );
        if (!alreadyCaptured && text.includes("Failed to load resource")) {
          found.push({
            id: ++failureIdRef.current,
            testName: currentTestName || "Error de red",
            friendlyMessage: generateFriendlyMessage("network", text),
            errorDetail: text,
            logContext: allLogs
              .slice(Math.max(0, i - 3), Math.min(allLogs.length, i + 3))
              .map((l) => l.text)
              .join("\n"),
          });
        }
      }
    }

    // Deduplicar por testName
    const unique = new Map<string, TestFailure>();
    for (const f of found) {
      const key = f.testName;
      if (!unique.has(key)) {
        unique.set(key, f);
      } else {
        // Merge context
        const existing = unique.get(key)!;
        existing.errorDetail += "\n" + f.errorDetail;
        existing.logContext += "\n" + f.logContext;
      }
    }

    return Array.from(unique.values());
  }, []);

  // ── Generar mensaje amigable ──────────────────────────────────────────
  function generateFriendlyMessage(testName: string, errorText: string): string {
    const lower = (testName + " " + errorText).toLowerCase();

    if (lower.includes("429") || lower.includes("too many requests"))
      return "El servidor rechazó la petición por exceso de solicitudes (rate limit 429)";
    if (lower.includes("timeout") && lower.includes("otp"))
      return "No se pudo verificar el OTP — el proceso tardó demasiado";
    if (lower.includes("timeout") && lower.includes("register"))
      return "El registro tardó más de lo esperado y se agotó el tiempo";
    if (lower.includes("timeout") && lower.includes("login"))
      return "La página de login no cargó a tiempo";
    if (lower.includes("timeout"))
      return "Se agotó el tiempo de espera — la página o acción tardó demasiado";
    if (lower.includes("500"))
      return "El servidor devolvió un error interno (500)";
    if (lower.includes("econnrefused"))
      return "No se pudo conectar al servidor — ¿está corriendo el backend?";
    if (lower.includes("console error") || lower.includes("capture console"))
      return "Se detectaron errores en la consola del navegador durante el test";
    if (lower.includes("email") && lower.includes("valid"))
      return "La validación de email no funcionó correctamente";
    if (lower.includes("password"))
      return "Problema con la validación o ingreso de contraseña";
    if (lower.includes("visible") || lower.includes("expect"))
      return "Un elemento esperado no apareció en pantalla";
    if (lower.includes("navigation") || lower.includes("url"))
      return "La navegación no fue al destino esperado";
    if (lower.includes("disabled") || lower.includes("enabled"))
      return "Un botón no estaba en el estado esperado (habilitado/deshabilitado)";
    if (lower.includes("network") || lower.includes("failed to load"))
      return "Error de red — una solicitud HTTP falló durante la prueba";

    return "El test no completó correctamente — revisar los detalles";
  }

  // ── Analizar error con IA ─────────────────────────────────────────────
  const analyzeWithAI = async (failure: TestFailure) => {
    setAnalyzingId(failure.id);
    setAnalysisResult(null);
    setAnalysisError(null);
    setAnalysisTestName(failure.testName);
    setShowAnalysisModal(true);

    try {
      const res = await fetch("/api/tests/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName: failure.testName,
          errorSummary: failure.errorDetail.substring(0, 1500),
          logContext: failure.logContext.substring(0, 2000),
        }),
      });

      const data = await res.json();

      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisError(data.error || "No se pudo obtener análisis");
      }
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : "Error al contactar el servicio de IA"
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  // ── Extraer failures cuando termina la ejecución ──────────────────────
  useEffect(() => {
    if (status === "done" && logs.length > 0 && stats.fail > 0) {
      const extracted = extractFailures(logs);
      setFailures(extracted);
    }
  }, [status, logs, stats.fail, extractFailures]);

  // ── Formatear tiempo ──────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Guard: solo admin ─────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div
            className="text-center p-8 rounded-2xl border"
            style={{
              backgroundColor: themeColors.surface + "50",
              borderColor: "#ef4444" + "40",
            }}
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
              Acceso Restringido
            </h2>
            <p style={{ color: themeColors.text.secondary }}>
              Esta sección es exclusiva para el administrador del sistema.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)`,
              }}
            >
              <FlaskConical className="w-7 h-7" style={{ color: themeColors.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                Test Runner
              </h1>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Ejecuta y monitorea tests E2E de Playwright
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            {status === "running" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{formatTime(elapsed)}</span>
              </div>
            )}
            {status === "done" && exitCode !== null && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  exitCode === 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {exitCode === 0 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {exitCode === 0 ? "Pasó" : "Falló"} ({formatTime(elapsed)})
                </span>
              </div>
            )}
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: themeColors.surface + "60",
                color: themeColors.text.secondary,
              }}
            >
              {tests.length} spec{tests.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Configuración + Lista de Tests */}
        <div className="grid grid-cols-12 gap-6">
          {/* Panel de Configuración */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Config Card */}
            <motion.div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: themeColors.surface + "40",
                borderColor: themeColors.primary + "20",
              }}
            >
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="w-full flex items-center justify-between p-4"
                style={{ color: themeColors.text.primary }}
              >
                <span className="font-semibold flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Configuración
                </span>
                {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-4"
                  >
                    {/* Navegador */}
                    <div>
                      <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text.secondary }}>
                        Navegador
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {PROJECTS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setConfig((c) => ({ ...c, project: p.id }))}
                            className={`p-2 rounded-lg text-xs font-medium transition-all border ${
                              config.project === p.id ? "ring-2" : ""
                            }`}
                            style={{
                              backgroundColor:
                                config.project === p.id
                                  ? themeColors.primary + "30"
                                  : themeColors.surface + "40",
                              borderColor:
                                config.project === p.id ? themeColors.primary : themeColors.primary + "15",
                              color: themeColors.text.primary,
                            }}
                          >
                            {p.icon} {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Headed mode */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium" style={{ color: themeColors.text.secondary }}>
                        Modo Headed (navegador visible)
                      </label>
                      <button
                        onClick={() => setConfig((c) => ({ ...c, headed: !c.headed }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          config.headed ? "bg-green-500" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            config.headed ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Filtro grep */}
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: themeColors.text.secondary }}>
                        Filtro (grep)
                      </label>
                      <input
                        type="text"
                        value={config.grep}
                        onChange={(e) => setConfig((c) => ({ ...c, grep: e.target.value }))}
                        placeholder='ej: "7 pasos" o "validación"'
                        className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                        style={{
                          backgroundColor: themeColors.surface + "60",
                          borderColor: themeColors.primary + "20",
                          color: themeColors.text.primary,
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Lista de Test Files */}
            <div
              className="rounded-2xl border p-4 space-y-3"
              style={{
                backgroundColor: themeColors.surface + "40",
                borderColor: themeColors.primary + "20",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: themeColors.text.primary }}>
                  <FileCode2 className="w-4 h-4" />
                  Test Specs
                </h3>
                <button
                  onClick={loadTests}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: themeColors.text.secondary }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botón: Ejecutar todos */}
              <button
                onClick={() => {
                  setConfig((c) => ({ ...c, file: null }));
                  setTimeout(runTests, 50);
                }}
                disabled={status === "running"}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                <Play className="w-4 h-4" />
                Ejecutar Todos
              </button>

              {/* Test files */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {tests.map((t) => (
                  <motion.div
                    key={t.name}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group"
                    style={{
                      backgroundColor:
                        config.file === t.name ? themeColors.primary + "15" : themeColors.surface + "20",
                      borderColor:
                        config.file === t.name ? themeColors.primary + "40" : themeColors.primary + "10",
                    }}
                    onClick={() => setConfig((c) => ({ ...c, file: t.name }))}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: themeColors.text.primary }}
                      >
                        {t.name}
                      </p>
                      <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                        {(t.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfig((c) => ({ ...c, file: t.name }));
                        setTimeout(runTests, 50);
                      }}
                      disabled={status === "running"}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 disabled:opacity-30"
                      style={{ color: themeColors.primary }}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {tests.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: themeColors.text.secondary }}>
                    Cargando tests...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Panel de Consola + Resultados */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Stats Bar */}
            {stats.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-3"
              >
                {[
                  { label: "Total", value: stats.total, icon: Terminal, color: themeColors.primary },
                  { label: "Pasados", value: stats.pass, icon: CheckCircle2, color: "#22c55e" },
                  { label: "Fallados", value: stats.fail, icon: XCircle, color: "#ef4444" },
                  { label: "Omitidos", value: stats.skip, icon: SkipForward, color: "#f59e0b" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{
                      backgroundColor: color + "10",
                      borderColor: color + "25",
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                    <div>
                      <p className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                        {value}
                      </p>
                      <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Consola */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: "#0d1117",
                borderColor: themeColors.primary + "20",
              }}
            >
              {/* Toolbar */}
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: themeColors.primary + "15" }}
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400">Consola</span>
                  {status === "running" && (
                    <span className="flex items-center gap-1 text-xs text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      En ejecución
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      autoScroll ? "bg-blue-500/20 text-blue-400" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Auto-scroll
                  </button>

                  {status === "running" ? (
                    <button
                      onClick={stopTests}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Square className="w-3 h-3" />
                      Detener
                    </button>
                  ) : (
                    <button
                      onClick={clearLogs}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Log output */}
              <div
                ref={logContainerRef}
                className="h-[55vh] overflow-y-auto p-4 font-mono text-sm leading-relaxed"
                style={{ scrollBehavior: "smooth" }}
              >
                {logs.length === 0 && status === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <FlaskConical className="w-12 h-12 mb-4 opacity-30" />
                    <p>Selecciona un test y presiona ejecutar</p>
                    <p className="text-xs mt-1">
                      Los resultados aparecerán aquí en tiempo real
                    </p>
                  </div>
                )}

                {logs.map((line) => (
                  <div key={line.id} className="flex gap-2 py-0.5 hover:bg-white/5 rounded px-1 -mx-1">
                    <span className="text-gray-600 text-xs mt-0.5 shrink-0 w-16">
                      {line.timestamp}
                    </span>
                    <span
                      className={`flex-1 break-all ${
                        line.type === "pass"
                          ? "text-green-400"
                          : line.type === "fail"
                          ? "text-red-400"
                          : line.type === "error"
                          ? "text-red-500"
                          : line.type === "skip"
                          ? "text-yellow-400"
                          : line.type === "system"
                          ? "text-blue-400"
                          : "text-gray-300"
                      }`}
                    >
                      {line.text}
                    </span>
                  </div>
                ))}

                <div ref={logEndRef} />
              </div>
            </div>

            {/* Barra de acción inferior */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.file && (
                  <span
                    className="text-xs px-2 py-1 rounded-full border flex items-center gap-1"
                    style={{
                      backgroundColor: themeColors.primary + "15",
                      borderColor: themeColors.primary + "30",
                      color: themeColors.text.primary,
                    }}
                  >
                    <FileCode2 className="w-3 h-3" />
                    {config.file}
                    <button
                      onClick={() => setConfig((c) => ({ ...c, file: null }))}
                      className="ml-1 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {config.grep && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                    grep: &quot;{config.grep}&quot;
                    <button
                      onClick={() => setConfig((c) => ({ ...c, grep: "" }))}
                      className="ml-1 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={runTests}
                disabled={status === "running"}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                {status === "running" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {config.file ? `Ejecutar ${config.file}` : "Ejecutar Todos"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── TABLA DE RESUMEN DE ERRORES ──────────────────────────────── */}
        <AnimatePresence>
          {status === "done" && failures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: themeColors.surface + "40",
                borderColor: "#ef4444" + "30",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b"
                style={{ borderColor: "#ef4444" + "20" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-500/15">
                    <Bug className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: themeColors.text.primary }}
                    >
                      Resumen de errores
                    </h3>
                    <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                      {failures.length} test{failures.length !== 1 ? "s" : ""} fallido
                      {failures.length !== 1 ? "s" : ""} — Haz clic en{" "}
                      <Sparkles className="w-3 h-3 inline text-purple-400" /> para analizar con IA
                    </p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="text-xs text-left border-b"
                      style={{
                        borderColor: themeColors.primary + "10",
                        color: themeColors.text.secondary,
                      }}
                    >
                      <th className="px-5 py-2.5 font-medium w-8">#</th>
                      <th className="px-5 py-2.5 font-medium">Test</th>
                      <th className="px-5 py-2.5 font-medium">Qué pasó</th>
                      <th className="px-5 py-2.5 font-medium w-20 text-center">Analizar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failures.map((f, idx) => (
                      <motion.tr
                        key={f.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b last:border-b-0 group transition-colors"
                        style={{
                          borderColor: themeColors.primary + "08",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            themeColors.primary + "08")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <td
                          className="px-5 py-3 text-xs font-mono"
                          style={{ color: themeColors.text.secondary }}
                        >
                          {idx + 1}
                        </td>
                        <td className="px-5 py-3">
                          <div>
                            <p
                              className="text-sm font-medium leading-snug"
                              style={{ color: themeColors.text.primary }}
                            >
                              {f.testName.length > 65
                                ? f.testName.substring(0, 65) + "…"
                                : f.testName}
                            </p>
                            {f.file && (
                              <p
                                className="text-xs font-mono mt-0.5"
                                style={{ color: themeColors.text.secondary + "90" }}
                              >
                                {f.file}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm" style={{ color: "#f87171" }}>
                            {f.friendlyMessage}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => analyzeWithAI(f)}
                            disabled={analyzingId === f.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                            style={{
                              background: `linear-gradient(135deg, #8b5cf6, #6366f1)`,
                              color: "#fff",
                              boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
                            }}
                            title="Analizar con IA"
                          >
                            {analyzingId === f.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            IA
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── MODAL DE ANÁLISIS IA ───────────────────────────────────── */}
        <AnimatePresence>
          {showAnalysisModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !analyzingId) setShowAnalysisModal(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-2xl max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
                style={{
                  backgroundColor: themeColors.surface,
                  borderColor: "#8b5cf6" + "40",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)",
                }}
              >
                {/* Modal Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b shrink-0"
                  style={{ borderColor: "#8b5cf6" + "20" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #8b5cf620, #6366f120)",
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: themeColors.text.primary }}
                      >
                        Análisis de IA
                      </h3>
                      <p
                        className="text-xs truncate"
                        style={{ color: themeColors.text.secondary }}
                        title={analysisTestName}
                      >
                        {analysisTestName}
                      </p>
                    </div>
                  </div>
                  {!analyzingId && (
                    <button
                      onClick={() => setShowAnalysisModal(false)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: themeColors.text.secondary }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-5">
                  {/* Loading state */}
                  {analyzingId && !analysisResult && !analysisError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 gap-5"
                    >
                      {/* Animated spinner */}
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="w-16 h-16 rounded-full border-2 border-transparent"
                          style={{
                            borderTopColor: "#8b5cf6",
                            borderRightColor: "#6366f1",
                          }}
                        />
                        <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center">
                        <p
                          className="font-medium text-sm"
                          style={{ color: themeColors.text.primary }}
                        >
                          Analizando el error...
                        </p>
                        <motion.p
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-xs mt-1.5"
                          style={{ color: themeColors.text.secondary }}
                        >
                          La IA está investigando la causa raíz del fallo
                        </motion.p>
                      </div>
                      {/* Progress dots */}
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-purple-400"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.2,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Error state */}
                  {analysisError && (
                    <div className="flex flex-col items-center py-12 gap-4">
                      <div className="p-3 rounded-full bg-red-500/15">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                      </div>
                      <div className="text-center">
                        <p
                          className="font-medium text-sm"
                          style={{ color: themeColors.text.primary }}
                        >
                          No se pudo analizar
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: themeColors.text.secondary }}
                        >
                          {analysisError}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success state */}
                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Severity badge */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            analysisResult.severity === "critical"
                              ? "bg-red-500/20 text-red-400"
                              : analysisResult.severity === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : analysisResult.severity === "config"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          <ShieldAlert className="w-3 h-3" />
                          {analysisResult.severity === "critical"
                            ? "Crítico"
                            : analysisResult.severity === "medium"
                            ? "Medio"
                            : analysisResult.severity === "config"
                            ? "Configuración"
                            : "Bajo"}
                        </span>
                      </div>

                      {/* Causa */}
                      <div
                        className="rounded-xl p-4 border"
                        style={{
                          backgroundColor: "#ef444410",
                          borderColor: "#ef444420",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Bug className="w-4 h-4 text-red-400 shrink-0" />
                          <h4 className="font-semibold text-sm text-red-400">
                            Causa del error
                          </h4>
                        </div>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: themeColors.text.primary }}
                        >
                          {analysisResult.cause}
                        </p>
                      </div>

                      {/* Solución */}
                      <div
                        className="rounded-xl p-4 border"
                        style={{
                          backgroundColor: "#22c55e10",
                          borderColor: "#22c55e20",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-green-400 shrink-0" />
                          <h4 className="font-semibold text-sm text-green-400">
                            Solución sugerida
                          </h4>
                        </div>
                        <p
                          className="text-sm leading-relaxed whitespace-pre-line"
                          style={{ color: themeColors.text.primary }}
                        >
                          {analysisResult.solution}
                        </p>
                      </div>

                      {/* Archivo hint */}
                      {analysisResult.file_hint && (
                        <div
                          className="rounded-xl p-4 border"
                          style={{
                            backgroundColor: "#6366f110",
                            borderColor: "#6366f120",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FileSearch className="w-4 h-4 text-indigo-400 shrink-0" />
                            <h4 className="font-semibold text-sm text-indigo-400">
                              Archivo probable
                            </h4>
                          </div>
                          <p
                            className="text-sm font-mono"
                            style={{ color: themeColors.text.primary }}
                          >
                            {analysisResult.file_hint}
                          </p>
                        </div>
                      )}

                      {/* Código sugerido */}
                      {analysisResult.code_suggestion && (
                        <div
                          className="rounded-xl p-4 border"
                          style={{
                            backgroundColor: "#0d1117",
                            borderColor: "#30363d",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                            <h4 className="font-semibold text-sm text-cyan-400">
                              Código sugerido
                            </h4>
                          </div>
                          <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                            {analysisResult.code_suggestion}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Modal Footer */}
                {!analyzingId && (analysisResult || analysisError) && (
                  <div
                    className="px-5 py-3 border-t flex justify-end shrink-0"
                    style={{ borderColor: themeColors.primary + "15" }}
                  >
                    <button
                      onClick={() => setShowAnalysisModal(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                      style={{ color: themeColors.text.primary }}
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
