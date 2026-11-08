import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Copy, Check } from "lucide-react";

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    await navigator.clipboard.writeText(code);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };
  return (
    <div className="my-3 overflow-hidden rounded-xl bg-ink-2 text-neutral-200">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-xs text-neutral-400">
        <span>{lang || "code"}</span>
        <button onClick={copiar} className="flex items-center gap-1.5 hover:text-white">
          {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-6"><code>{code}</code></pre>
    </div>
  );
}

export function Markdown({ texto }: { texto: string }) {
  return (
    <div className="prose-tutor text-[15px]">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "");
            const conteudo = String(children).replace(/\n$/, "");
            if (match || conteudo.includes("\n")) return <CodeBlock lang={match?.[1] ?? ""} code={conteudo} />;
            return <code>{children}</code>;
          },
        }}
      >
        {texto}
      </ReactMarkdown>
    </div>
  );
}
