import { useEffect, useRef, useState } from "react";
import { Sparkles, Paperclip, ArrowUp, HelpCircle, Code2, Play } from "lucide-react";
import { Markdown } from "./Markdown";
import { YinYang } from "./YinYang";
import type { Mensagem } from "../data";

const iconeSugestao = [HelpCircle, Code2, Play];

interface Props {
  mensagens: Mensagem[];
  sugestoes: string[];
  onEnviar: (texto: string) => void;
}

export function ChatArea({ mensagens, sugestoes, onEnviar }: Props) {
  const [texto, setTexto] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviar = () => {
    if (!texto.trim()) return;
    onEnviar(texto.trim());
    setTexto("");
  };

  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-l-[28px] bg-cream">
      {/* ensō marca d'água */}
      <svg className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" viewBox="0 0 200 200">
        <path d="M100 18 A82 82 0 1 1 40 46" stroke="#141414" strokeWidth="14" strokeLinecap="round" fill="none" />
      </svg>

      <header className="relative flex items-center justify-between px-8 pt-6">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Sparkles size={16} /> Seu mentor de programação com IA
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 text-sm text-neutral-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Online
        </div>
      </header>

      <div className="relative flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto flex max-w-[720px] flex-col gap-6">
          {mensagens.map((m) =>
            m.autor === "aluno" ? (
              <div key={m.id} className="flex items-start justify-end gap-3">
                <div className="max-w-[70%] rounded-2xl bg-ink-2 px-5 py-3.5 text-[15px] leading-relaxed text-white">{m.texto}</div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white">G</div>
              </div>
            ) : (
              <div key={m.id} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink"><YinYang className="h-9 w-9" /></div>
                <div className="max-w-[85%] rounded-2xl border border-line bg-card/80 px-5 py-4 text-neutral-800 shadow-sm">
                  <Markdown texto={m.texto} />
                </div>
              </div>
            ),
          )}

          <div className="flex flex-wrap gap-2 pl-15">
            {sugestoes.map((s, i) => {
              const Icon = iconeSugestao[i % iconeSugestao.length];
              return (
                <button key={s} onClick={() => onEnviar(s)} className="flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-[13px] text-neutral-700 transition hover:bg-white">
                  <Icon size={15} /> {s}
                </button>
              );
            })}
          </div>
          <div ref={fimRef} />
        </div>
      </div>

      <div className="relative px-8 pb-6">
        <div className="mx-auto flex max-w-[780px] items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2.5 shadow-sm">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-2 text-neutral-600"><Paperclip size={18} /></button>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            placeholder="Digite sua pergunta ou desafio..."
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-neutral-500"
          />
          <button onClick={enviar} className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition hover:scale-105"><ArrowUp size={18} /></button>
        </div>
      </div>
    </main>
  );
}
