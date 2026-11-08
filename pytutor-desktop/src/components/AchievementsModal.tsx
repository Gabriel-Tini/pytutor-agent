import { X, Star, Code2, Flame, BookOpen, Trophy, Cpu, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { catalogoConquistas, type Skill } from "../data";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  skills: Skill[];
  xp: number;
  nivel: number;
}

const ICON_MAP = {
  code: Code2,
  flame: Flame,
  book: BookOpen,
  trophy: Trophy,
  cpu: Cpu,
  sparkles: Sparkles,
};

export function AchievementsModal({ aberto, onFechar, skills, xp, nivel }: Props) {
  if (!aberto) return null;

  const qtdDominados = skills.filter((s) => s.status === "dominado").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
      <div className="relative flex h-full max-h-[760px] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-ink text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div>
            <div className="flex items-center gap-2.5 text-xl font-semibold text-white">
              <Star size={20} className="fill-gold text-gold" />
              <span>Salão de Conquistas & Insígnias Zen</span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Nível {nivel} • {xp} XP Acumulados • {qtdDominados} / {skills.length} Conceitos Dominados no Obsidian
            </p>
          </div>
          <button
            onClick={onFechar}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-300 hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid de Conquistas */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {catalogoConquistas.map((conq) => {
              const Icon = ICON_MAP[conq.icone];
              const desbloqueada = qtdDominados >= conq.requisitoCheckpoints;
              const progressoAtual = Math.min(
                100,
                Math.round((qtdDominados / conq.requisitoCheckpoints) * 100)
              );

              return (
                <div
                  key={conq.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                    desbloqueada
                      ? "border-gold bg-gold/10 glow-gold"
                      : "border-white/10 bg-white/[0.03] opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
                        desbloqueada
                          ? "border-gold bg-gold text-ink"
                          : "border-white/10 bg-white/5 text-neutral-400"
                      }`}
                    >
                      <Icon size={26} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{conq.titulo}</h3>
                        {desbloqueada ? (
                          <CheckCircle2 size={16} className="text-gold" />
                        ) : (
                          <Lock size={15} className="text-neutral-500" />
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-300">{conq.descricao}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-gold font-medium">+{conq.xpBonus} XP Bônus</span>
                      <span className="text-neutral-400">
                        {Math.min(qtdDominados, conq.requisitoCheckpoints)} / {conq.requisitoCheckpoints} Checkpoints ({progressoAtual}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${desbloqueada ? "bg-gold" : "bg-violet"}`}
                        style={{ width: `${progressoAtual}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
