import { BarChart3, CheckCircle2, Circle, Lock, ChevronRight, Star, ArrowRight, Code2, Flame, BookOpen } from "lucide-react";
import type { Skill } from "../data";

function IconeStatus({ s }: { s: Skill }) {
  if (s.status === "dominado") return <CheckCircle2 size={18} className="glow-gold rounded-full fill-gold text-white" />;
  if (s.status === "refinando") return <Circle size={18} strokeWidth={2.5} className="pulse-violet rounded-full text-violet" />;
  return <Lock size={16} className="text-neutral-400" />;
}

const conquistas = [
  { icon: Code2, label: "Código\nPerfeito" },
  { icon: Flame, label: "Sequência\nde 7 dias" },
  { icon: BookOpen, label: "Aprendiz\nCurioso" },
];

export function RightPanel({
  jornada,
  xp,
  nivel,
  onAbrirPratica,
  onAbrirSkillTree,
}: {
  jornada: Skill[];
  xp: number;
  nivel: number;
  onAbrirPratica?: () => void;
  onAbrirSkillTree?: () => void;
}) {
  // Exibe na coluna lateral os 4 primeiros conceitos ou a janela em torno do atual
  const visiveis = jornada.slice(0, 4);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-5 overflow-y-auto bg-cream-2 px-5 py-6">
      {/* Nível */}
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-[3px] ring-2 ring-gold">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-semibold text-white">G</div>
          </div>
          <div>
            <div className="text-xl font-semibold">Nível {nivel}</div>
            <div className="text-sm text-neutral-600">Aprendiz Zen</div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${Math.min(100, (xp / 1000) * 100)}%` }} />
        </div>
        <div className="mt-2 text-center text-xs text-neutral-600">{xp} / 1.000 XP</div>
      </div>

      {/* Jornada */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold"><BarChart3 size={16} /> Sua Jornada</span>
          <button onClick={onAbrirSkillTree} className="text-xs font-medium text-gold hover:underline">
            Árvore Completa
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {visiveis.map((s) => (
            <div
              key={s.id}
              onClick={() => (s.status !== "bloqueado" ? onAbrirPratica?.() : onAbrirSkillTree?.())}
              className={`rounded-xl px-3 py-2.5 text-sm cursor-pointer transition ${
                s.status === "refinando" ? "bg-card font-medium shadow-sm hover:ring-1 hover:ring-violet" : "bg-card/50 hover:bg-card"
              } ${s.status === "bloqueado" ? "text-neutral-500" : ""}`}
            >
              <div className="flex items-center gap-3">
                <IconeStatus s={s} />
                <span className="flex-1 truncate">{s.titulo}</span>
                {s.status === "refinando" && <ChevronRight size={16} />}
              </div>
              <div className="mt-2 ml-[30px] flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${
                      s.status === "dominado" ? "bg-gold" : s.status === "refinando" ? "bg-violet" : "bg-neutral-400"
                    }`}
                    style={{ width: `${s.progresso}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500">{s.progresso}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conquistas */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold"><Star size={16} className="fill-ink" /> Conquistas Recentes</span>
          <button onClick={onAbrirSkillTree} className="flex items-center gap-1 text-xs text-neutral-600 hover:text-ink">
            Ver todas <ArrowRight size={13} />
          </button>
        </div>
        <div className="flex justify-around">
          {conquistas.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-gold ring-2 ring-gold/60"><Icon size={20} /></div>
              <span className="whitespace-pre text-center text-[10px] leading-tight text-neutral-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Citação */}
      <div className="relative mt-auto h-[130px] overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-ink p-4 text-white">
        <div className="absolute right-4 top-3 h-16 w-16 rounded-full bg-[#e8dcc4] opacity-90" />
        <svg className="absolute bottom-0 right-2 h-20 w-24 text-black" viewBox="0 0 100 80" fill="currentColor">
          <path d="M20 80 L20 60 L80 60 L80 80 Z M15 60 L50 48 L85 60 Z M30 48 L30 36 L70 36 L70 48 Z M25 36 L50 26 L75 36 Z M42 26 L42 18 L58 18 L58 26 Z M38 18 L50 10 L62 18 Z" />
        </svg>
        <div className="absolute bottom-4 left-4 text-sm leading-snug">Disciplina é<br />a chave do progresso.</div>
      </div>
    </aside>
  );
}
