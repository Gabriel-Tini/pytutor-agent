import { X, FolderOpen, Lock, CheckCircle2, Play, Sparkles } from "lucide-react";
import { catalogoProjetos, type Skill, type ProjetoPratico } from "../data";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  skills: Skill[];
  onIniciarProjeto: (projeto: ProjetoPratico) => void;
}

export function ProjectsModal({ aberto, onFechar, skills, onIniciarProjeto }: Props) {
  if (!aberto) return null;

  const mapSkills = new Map(skills.map((s) => [s.id, s]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
      <div className="relative flex h-full max-h-[780px] w-full max-w-[960px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-ink text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div>
            <div className="flex items-center gap-2.5 text-xl font-semibold text-white">
              <FolderOpen size={20} className="text-gold" />
              <span>Laboratório de Projetos Práticos (Zero Caixa-Preta)</span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Projetos integradores desbloqueados conforme você domina os nós da Árvore de Grafos.
            </p>
          </div>
          <button
            onClick={onFechar}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-300 hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Projetos */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {catalogoProjetos.map((proj) => {
            const reqSkill = mapSkills.get(proj.requisitoSkillId);
            const desbloqueado = reqSkill?.status === "dominado" || reqSkill?.status === "refinando";
            const concluido = reqSkill?.status === "dominado";

            return (
              <div
                key={proj.id}
                className={`flex items-center justify-between gap-6 rounded-2xl border p-5 transition ${
                  concluido
                    ? "border-gold/50 bg-gold/10"
                    : desbloqueado
                    ? "border-violet/60 bg-violet/10"
                    : "border-white/10 bg-white/[0.02] opacity-65"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs text-gold">
                      Fase {proj.faseRequerida} • Requer Módulo #{proj.requisitoSkillId}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <Sparkles size={13} /> +{proj.xpRecompensa} XP
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white">{proj.titulo}</h3>
                  <p className="mt-1 text-sm text-neutral-300">{proj.descricao}</p>
                  <div className="mt-2 text-xs text-neutral-400">
                    <strong>Entregável:</strong> {proj.entregavel}
                  </div>
                </div>

                <div>
                  {desbloqueado ? (
                    <button
                      onClick={() => {
                        onIniciarProjeto(proj);
                        onFechar();
                      }}
                      className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110"
                    >
                      {concluido ? <CheckCircle2 size={16} /> : <Play size={16} />}
                      <span>{concluido ? "Revisar Projeto" : "Construir Agora"}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-neutral-400">
                      <Lock size={15} />
                      <span>Domine #{proj.requisitoSkillId}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
