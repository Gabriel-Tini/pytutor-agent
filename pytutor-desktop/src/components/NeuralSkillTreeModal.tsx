import { useLayoutEffect, useRef, useState } from "react";
import { X, CheckCircle2, Lock, Sparkles, FolderGit2 } from "lucide-react";
import { YinYang } from "./YinYang";
import { FASES_CURRICULARES, type Skill, type ObsidianState } from "../data";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  skills: Skill[];
  obsidian: ObsidianState | null;
  onSelecionarSkill: (skill: Skill) => void;
}

interface EdgePath {
  id: string;
  d: string;
  status: "dominado" | "refinando" | "bloqueado";
}

export function NeuralSkillTreeModal({ aberto, onFechar, skills, obsidian, onSelecionarSkill }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [edges, setEdges] = useState<EdgePath[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 1100, height: 1800 });

  const recalcularConexoes = () => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    setSvgSize({
      width: Math.max(container.scrollWidth, cRect.width),
      height: Math.max(container.scrollHeight, cRect.height),
    });

    const mapSkills = new Map(skills.map((s) => [s.id, s]));
    const novasEdges: EdgePath[] = [];

    for (const child of skills) {
      const childEl = nodeRefs.current[child.id];
      if (!childEl) continue;
      const childRect = childEl.getBoundingClientRect();

      // Ponto superior central do nó descendente
      const x2 = childRect.left - cRect.left + container.scrollLeft + childRect.width / 2;
      const y2 = childRect.top - cRect.top + container.scrollTop;

      for (const parentId of child.parents) {
        const parentEl = nodeRefs.current[parentId];
        const parentSkill = mapSkills.get(parentId);
        if (!parentEl || !parentSkill) continue;

        const parentRect = parentEl.getBoundingClientRect();
        // Ponto inferior central do nó pré-requisito
        const x1 = parentRect.left - cRect.left + container.scrollLeft + parentRect.width / 2;
        const y1 = parentRect.top - cRect.top + container.scrollTop + parentRect.height;

        const midY = y1 + (y2 - y1) * 0.5;
        const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

        let edgeStatus: "dominado" | "refinando" | "bloqueado" = "bloqueado";
        if (parentSkill.status === "dominado" && child.status === "dominado") {
          edgeStatus = "dominado";
        } else if (parentSkill.status === "dominado" && child.status === "refinando") {
          edgeStatus = "refinando";
        }

        novasEdges.push({
          id: `${parentId}->${child.id}`,
          d,
          status: edgeStatus,
        });
      }
    }

    setEdges(novasEdges);
  };

  useLayoutEffect(() => {
    if (!aberto) return;
    const timer = setTimeout(recalcularConexoes, 80);
    window.addEventListener("resize", recalcularConexoes);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", recalcularConexoes);
    };
  }, [aberto, skills]);

  if (!aberto) return null;

  const fases = [1, 2, 3, 4, 5] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <div className="relative flex h-full max-h-[890px] w-full max-w-[1260px] flex-col overflow-hidden rounded-3xl border border-[#d6cbb9] bg-[#e8dfd1] text-ink shadow-2xl">
        {/* Textura de pergaminho / sumi-e nas bordas */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 92% 12%, rgba(20,20,20,0.45) 0%, transparent 28%), radial-gradient(circle at 6% 88%, rgba(20,20,20,0.35) 0%, transparent 26%)",
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#cfc2ae] bg-[#dfd4c2]/95 px-8 py-4">
          <div>
            <div className="flex items-center gap-2.5 text-xl font-bold text-ink">
              <Sparkles size={20} className="text-[#9a7422]" />
              <span>Árvore de Grafos do Currículo (Fases 1 a 5 — 24 Módulos Atômicos)</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-5 text-xs text-neutral-700">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-3 w-3 rounded-full bg-gold glow-gold" /> Dominado (100% — Libera Módulos Seguintes)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-3 w-3 rounded-full bg-violet pulse-violet" /> Em Refinamento (Disponível para Estudo)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-3 w-3 rounded-full bg-neutral-500" /> Bloqueado (Requer Módulos Anteriores)
              </span>
              {obsidian && (
                <span className="flex items-center gap-1.5 text-neutral-700">
                  <FolderGit2 size={13} className="text-[#9a7422]" />
                  Vault: <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[11px]">{obsidian.checkpoints_dir}</code>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onFechar}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-ink transition hover:bg-black/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Área do Grafo com Conexões de Pré-Requisitos */}
        <div
          ref={containerRef}
          onScroll={recalcularConexoes}
          className="relative flex-1 overflow-y-auto px-8 py-7"
        >
          {/* Camada SVG das Arestas Direcionadas */}
          <svg
            width={svgSize.width}
            height={svgSize.height}
            className="pointer-events-none absolute top-0 left-0 z-10"
          >
            <defs>
              <marker id="arrow-gold" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#c9a24a" />
              </marker>
              <marker id="arrow-violet" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#8b5cf6" />
              </marker>
              <marker id="arrow-ink" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#2a2826" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const stroke =
                edge.status === "dominado"
                  ? "#c9a24a"
                  : edge.status === "refinando"
                  ? "#8b5cf6"
                  : "#2a2826";
              const marker =
                edge.status === "dominado"
                  ? "url(#arrow-gold)"
                  : edge.status === "refinando"
                  ? "url(#arrow-violet)"
                  : "url(#arrow-ink)";

              return (
                <g key={edge.id}>
                  {edge.status !== "bloqueado" && (
                    <path
                      d={edge.d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={6}
                      strokeOpacity={0.25}
                    />
                  )}
                  <path
                    d={edge.d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={edge.status === "bloqueado" ? 1.8 : 2.8}
                    strokeDasharray={edge.status === "bloqueado" ? "5 4" : undefined}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </svg>

          {/* Fases Curriculares (Fase 1 a Fase 5) e seus Níveis Internos de Grafo */}
          <div className="relative z-20 flex flex-col gap-10">
            {fases.map((numFase) => {
              const skillsDaFase = skills.filter((s) => s.fase === numFase);
              const niveisDaFase = Array.from(new Set(skillsDaFase.map((s) => s.nivelGrafo))).sort(
                (a, b) => a - b
              );
              const infoFase = FASES_CURRICULARES[numFase];

              return (
                <div
                  key={numFase}
                  className="flex rounded-2xl border border-[#cbbba2] bg-[#f4efe6]/70 px-6 py-6 shadow-sm backdrop-blur-[2px]"
                >
                  {/* Rótulo Lateral da Fase Curricular */}
                  <div className="flex w-[180px] shrink-0 flex-col justify-center border-r border-[#d4c7b2] pr-5">
                    <div className="text-xs font-bold tracking-widest text-[#9a7422] uppercase">
                      {infoFase.titulo}
                    </div>
                    <div className="mt-1 text-sm font-extrabold leading-snug text-ink">
                      {infoFase.subtitulo}
                    </div>
                    <div className="mt-2 text-[11px] text-neutral-600">
                      {skillsDaFase.filter((s) => s.status === "dominado").length} / {skillsDaFase.length} dominados
                    </div>
                  </div>

                  {/* Linhas de Profundidade (Níveis de Pré-Requisito dentro da Fase) */}
                  <div className="flex flex-1 flex-col gap-10 pl-6">
                    {niveisDaFase.map((nivel) => {
                      const nodosDoNivel = skillsDaFase.filter((s) => s.nivelGrafo === nivel);

                      return (
                        <div key={nivel} className="flex items-center justify-around gap-6">
                          {nodosDoNivel.map((nodo) => {
                            const isGold = nodo.status === "dominado";
                            const isViolet = nodo.status === "refinando";

                            return (
                              <div
                                key={nodo.id}
                                ref={(el) => {
                                  nodeRefs.current[nodo.id] = el;
                                }}
                                onClick={() => {
                                  if (nodo.status !== "bloqueado") {
                                    onSelecionarSkill(nodo);
                                    onFechar();
                                  }
                                }}
                                title={nodo.descricao}
                                className={`relative w-[255px] rounded-2xl border-2 px-4 pt-5 pb-3.5 transition-all select-none ${
                                  isGold
                                    ? "cursor-pointer border-gold bg-[#fbf6e9] glow-gold hover:scale-[1.03]"
                                    : isViolet
                                    ? "cursor-pointer border-violet bg-[#f6f1ff] pulse-violet hover:scale-[1.03]"
                                    : "cursor-not-allowed border-neutral-500/60 bg-[#ded8ce] opacity-75"
                                }`}
                              >
                                {/* Emblema no Topo Central do Nó */}
                                <div
                                  className={`absolute -top-3.5 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 shadow ${
                                    isGold
                                      ? "border-gold bg-gold text-white"
                                      : isViolet
                                      ? "border-violet bg-violet text-white"
                                      : "border-neutral-600 bg-neutral-700 text-neutral-300"
                                  }`}
                                >
                                  {isGold ? (
                                    <CheckCircle2 size={15} />
                                  ) : isViolet ? (
                                    <YinYang className="h-4 w-4" />
                                  ) : (
                                    <Lock size={13} />
                                  )}
                                </div>

                                {/* Cabeçalho e Título do Conceito */}
                                <div className="text-center">
                                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                    MÓDULO #{nodo.id}
                                    {nodo.parents.length > 0
                                      ? ` • DEPENDE DE: #${nodo.parents.join(", #")}`
                                      : " • INÍCIO DA TRILHA"}
                                  </div>
                                  <div className="mt-0.5 text-sm font-bold text-ink">{nodo.titulo}</div>
                                  <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-600">
                                    {nodo.descricao}
                                  </div>
                                </div>

                                {/* Barra de Progresso Linear 0 a 100% */}
                                <div className="mt-3">
                                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
                                    <span
                                      className={
                                        isGold
                                          ? "text-[#9a7422]"
                                          : isViolet
                                          ? "text-violet"
                                          : "text-neutral-600"
                                      }
                                    >
                                      {isGold ? "🏆 DOMINADO" : isViolet ? "⏳ DISPONÍVEL" : "🔒 BLOQUEADO"}
                                    </span>
                                    <span className="text-ink">{nodo.progresso}%</span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/15">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isGold ? "bg-gold" : isViolet ? "bg-violet" : "bg-neutral-500"
                                      }`}
                                      style={{ width: `${nodo.progresso}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
    </div>
  );
}
