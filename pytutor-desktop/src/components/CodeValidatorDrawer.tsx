import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Send, X, Terminal, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exit_code: number | null;
  timed_out: boolean;
  error?: string;
}

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onEnviarAoTutor: (codigo: string, output: string) => void;
  codigoInicial?: string;
}

const CODIGO_EXEMPLO = `# Escreva sua solução em Python 3.10+
def saudacao(nome: str) -> str:
    return f"Olá, {nome}!"

# Casos de Teste (Assertions)
assert saudacao("Dev") == "Olá, Dev!"
assert saudacao("Gabriel") == "Olá, Gabriel!"

print("✓ Todos os testes passaram com sucesso!")
`;

export function CodeValidatorDrawer({ aberto, onFechar, onEnviarAoTutor, codigoInicial }: Props) {
  const [codigo, setCodigo] = useState(codigoInicial || CODIGO_EXEMPLO);
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<ExecutionResult | null>(null);

  if (!aberto) return null;

  const executarCodigo = async () => {
    setExecutando(true);
    setResultado(null);
    try {
      const res = await invoke<ExecutionResult>("execute_python_code", { code: codigo });
      setResultado(res);
    } catch (err: unknown) {
      setResultado({
        stdout: "",
        stderr: String(err),
        exit_code: 1,
        timed_out: false,
        error: String(err),
      });
    } finally {
      setExecutando(false);
    }
  };

  const enviarAoTutor = () => {
    const output = resultado
      ? [
          resultado.stdout ? `stdout:\n${resultado.stdout}` : "",
          resultado.stderr ? `stderr / Traceback:\n${resultado.stderr}` : "",
          `exit_code: ${resultado.exit_code}`,
        ]
          .filter(Boolean)
          .join("\n\n")
      : "Código submetido sem execução prévia.";

    onEnviarAoTutor(codigo, output);
  };

  return (
    <div className="absolute inset-y-0 right-0 z-30 flex w-[580px] flex-col border-l border-line bg-card shadow-2xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2 font-semibold text-neutral-800">
          <Terminal size={18} className="text-gold" />
          <span>Validador de Código Local</span>
        </div>
        <button
          onClick={onFechar}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200"
        >
          <X size={18} />
        </button>
      </div>

      {/* Editor Monaco */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={codigo}
          onChange={(v) => setCodigo(v || "")}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>

      {/* Terminal / Painel de Saída */}
      <div className="h-[220px] border-t border-neutral-700 bg-ink-2 p-4 text-xs font-mono text-neutral-300 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Terminal size={14} /> Saída do Subprocesso (Timeout: 5.0s)
          </span>
          {resultado && (
            <span className="flex items-center gap-1">
              {resultado.timed_out ? (
                <span className="text-amber-400 flex items-center gap-1"><Clock size={12} /> Timeout</span>
              ) : resultado.exit_code === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Sucesso</span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1"><AlertTriangle size={12} /> Erro ({resultado.exit_code})</span>
              )}
            </span>
          )}
        </div>

        {executando ? (
          <div className="flex h-32 items-center justify-center text-neutral-400">
            Executando no Python local...
          </div>
        ) : resultado ? (
          <div>
            {resultado.stdout && (
              <pre className="text-emerald-300 whitespace-pre-wrap">{resultado.stdout}</pre>
            )}
            {resultado.stderr && (
              <pre className="text-rose-400 whitespace-pre-wrap mt-1">{resultado.stderr}</pre>
            )}
            {!resultado.stdout && !resultado.stderr && (
              <div className="text-neutral-500 italic">Processo finalizou sem saída de terminal.</div>
            )}
          </div>
        ) : (
          <div className="text-neutral-500 italic">
            Clique em "Executar & Testar" para rodar o código localmente.
          </div>
        )}
      </div>

      {/* Footer com Ações */}
      <div className="flex items-center justify-between border-t border-line bg-cream px-5 py-3">
        <button
          onClick={executarCodigo}
          disabled={executando}
          className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          <Play size={16} className="fill-white" />
          <span>{executando ? "Executando..." : "Executar & Testar"}</span>
        </button>

        <button
          onClick={enviarAoTutor}
          className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
        >
          <Send size={15} />
          <span>Enviar Saída ao Tutor</span>
        </button>
      </div>
    </div>
  );
}
