import { BarChart3, Trophy, FolderOpen, Star, Settings, MessageSquare, Zap, ChevronRight } from "lucide-react";
import { YinYang } from "./YinYang";

export type AbaMenu = "jornada" | "desafios" | "projetos" | "conquistas" | "configuracoes";

interface Props {
  onNovoChat: () => void;
  onSelecionarMenu: (aba: AbaMenu) => void;
}

const itens: { icon: typeof BarChart3; label: string; id: AbaMenu }[] = [
  { icon: BarChart3, label: "Minha Jornada", id: "jornada" },
  { icon: Trophy, label: "Desafios", id: "desafios" },
  { icon: FolderOpen, label: "Projetos", id: "projetos" },
  { icon: Star, label: "Conquistas", id: "conquistas" },
  { icon: Settings, label: "Configurações", id: "configuracoes" },
];

export function Sidebar({ onNovoChat, onSelecionarMenu }: Props) {
  return (
    <aside className="relative flex w-[240px] shrink-0 flex-col overflow-hidden bg-ink px-4 py-6 text-neutral-200">
      {/* ondas decorativas */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 240 800" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M-20 ${380 + i * 40} C 60 ${300 + i * 40}, 160 ${480 + i * 40}, 260 ${360 + i * 40}`} stroke="white" strokeWidth="1.2" fill="none" />
        ))}
      </svg>

      <div className="relative flex items-center gap-3 px-1">
        <YinYang className="h-12 w-12" />
        <div>
          <div className="text-lg font-semibold text-white">PyTutor</div>
          <div className="text-[11px] text-neutral-400">Aprenda. Pratique. Evolua.</div>
        </div>
      </div>

      <div className="relative my-6 h-px bg-white/10" />

      <button onClick={onNovoChat} className="relative mb-4 flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-sm text-white transition hover:bg-white/15">
        <span className="flex items-center gap-3"><MessageSquare size={18} /> Novo Chat</span>
        <span className="text-xs text-neutral-400">Ctrl&nbsp;&nbsp;K</span>
      </button>

      <nav className="relative flex flex-col gap-1">
        {itens.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => onSelecionarMenu(id)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
          >
            <Icon size={18} strokeWidth={1.6} /> {label}
          </button>
        ))}
      </nav>

      <div
        onClick={() => onSelecionarMenu("desafios")}
        className="relative mt-auto flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3 transition hover:bg-white/10"
      >
        <Zap size={22} className="shrink-0 fill-gold text-gold" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gold">Bônus de hoje</div>
          <div className="text-[11px] leading-tight text-neutral-300">Complete 1 desafio para ganhar +50 XP!</div>
        </div>
        <ChevronRight size={16} className="text-neutral-400" />
      </div>
    </aside>
  );
}
