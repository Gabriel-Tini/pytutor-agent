import { X, CheckCircle2, Circle, Lock, Sparkles, FolderGit2 } from "lucide-react";
import type { Skill, ObsidianState } from "../data";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  skills: Skill[];
  obsidian: ObsidianState | null;
  onSelecionarSkill: (skill: Skill) => void;
}

const FASES_NOMES: Record<number, string> = {
  1: "Fase 1: Python Básico com Mentalidade de Dados",
  2: "Fase 2: Python Intermediário/Avançado para IA",
  3: "Fase 3: Matemática Computacional & Vetorização",
  4: "Fase 4: Machine Learning Clássico",
  5: "Fase 5: Deep Learning & Redes Neurais",
};

export function NeuralSkillTreeModal({ aberto, onFechar, skills, obsidian, onSelecionarSkill }: Props) {
  if (!aberto) return null;

  const fases = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-8 backdrop-blur-sm">
      <div className="relative flex h-full max-h-[820px] w-full max-w-[1120px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-ink text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div>
            <div className="flex items-center gap-2.5 text-xl font-semibold text-white">
              <Sparkles size={20} className="text-gold" />
              <span>Neural Skill Tree — Arquitetura Curricular</span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gold glow-gold" /> Dominado (100%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-violet pulse-violet" /> Em Refinamento
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-600" /> Bloqueado
              </span>
              {obsidian && (
                <span className="ml-4 flex items-center gap-1.5 text-neutral-300">
                  <FolderGit2 size={13} className="text-gold" />
                  Vault: <code className="text-gold">{obsidian.checkpoints_dir}</code>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onFechar}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-300 hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grafo em Camadas Neurais */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {fases.map((numFase) => {
            const nodosDaFase = skills.filter((s) => s.fase === numFase);
            return (
              <div key={numFase} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 text-sm font-semibold tracking-wide text-neutral-300 uppercase">
                  {FASES_NOMES[numFase]}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {nodosDaFase.map((nodo) => {
                    const isGold = nodo.status === "dominado";
                    const isViolet = nodo.status === "refinando";

                    return (
                      <div
                        key={nodo.id}
                        onClick={() => {
                          if (nodo.status !== "bloqueado") {
                            onSelecionarSkill(nodo);
                            onFechar();
                          }
                        }}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                          isGold
                            ? "cursor-pointer border-gold/60 bg-gold/10 glow-gold"
                            : isViolet
                            ? "cursor-pointer border-violet bg-violet/10 pulse-violet"
                            : "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-neutral-400">#{nodo.id}</span>
                            {isGold ? (
                              <CheckCircle2 size={18} className="text-gold" />
                            ) : isViolet ? (
                              <Circle size={18} className="text-violet" />
                            ) : (
                              <Lock size={16} className="text-neutral-500" />
                            )}
                          </div>
                          <div className="mt-2 font-semibold text-white">{nodo.titulo}</div>
                          <p className="mt-1 text-xs leading-relaxed text-neutral-400">{nodo.descricao}</p>
                        </div>

                        {/* Barra de progresso linear 0 a 100% */}
                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-[11px] font-medium">
                            <span className={isGold ? "text-gold" : isViolet ? "text-violet" : "text-neutral-500"}>
                              {isGold ? "DOMINADO" : isViolet ? "EM REFINAMENTO" : "BLOQUEADO"}
                            </span>
                            <span className="text-neutral-300">{nodo.progresso}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isGold ? "bg-gold" : isViolet ? "bg-violet" : "bg-neutral-600"
                              }`}
                              style={{ width: `${nodo.progresso}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
