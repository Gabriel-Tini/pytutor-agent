import { useState } from "react";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { RightPanel } from "./components/RightPanel";
import { CodeValidatorDrawer } from "./components/CodeValidatorDrawer";
import { jornada, mensagensIniciais, sugestoes, type Mensagem } from "./data";
import { streamTutorChat } from "./gemini";

export default function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensIniciais);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [gerandoResposta, setGerandoResposta] = useState(false);

  const enviar = async (texto: string) => {
    const novaMensagemAluno: Mensagem = { id: crypto.randomUUID(), autor: "aluno", texto };
    const historicoAtual = [...mensagens, novaMensagemAluno];
    setMensagens(historicoAtual);

    if (texto.toLowerCase().includes("praticar") || texto.toLowerCase().includes("desafio")) {
      setDrawerAberto(true);
    }

    if (!apiKey.trim()) {
      const chavePrompt = window.prompt("Por favor, insira sua GEMINI_API_KEY para streaming com o Tutor:");
      if (chavePrompt) {
        localStorage.setItem("GEMINI_API_KEY", chavePrompt.trim());
        setApiKey(chavePrompt.trim());
      } else {
        return;
      }
    }

    const chaveAtiva = apiKey.trim() || localStorage.getItem("GEMINI_API_KEY") || "";
    if (!chaveAtiva) return;

    setGerandoResposta(true);
    const tutorId = crypto.randomUUID();
    setMensagens((ms) => [...ms, { id: tutorId, autor: "tutor", texto: "..." }]);

    try {
      let textoAcumulado = "";
      for await (const chunk of streamTutorChat(chaveAtiva, historicoAtual, texto)) {
        textoAcumulado += chunk;
        setMensagens((prev) =>
          prev.map((m) => (m.id === tutorId ? { ...m, texto: textoAcumulado } : m))
        );
      }
    } catch (err: unknown) {
      setMensagens((prev) =>
        prev.map((m) =>
          m.id === tutorId
            ? { ...m, texto: `⚠️ Erro ao se conectar com o Tutor de IA: ${String(err)}` }
            : m
        )
      );
    } finally {
      setGerandoResposta(false);
    }
  };

  const handleEnviarAoTutor = (codigo: string, output: string) => {
    setDrawerAberto(false);
    const mensagemFormatada = `Submissão de Código para Auditoria Socrática:\n\n\`\`\`python\n${codigo}\n\`\`\`\n\n**Saída do Terminal Local (Python):**\n\`\`\`text\n${output}\n\`\`\``;
    enviar(mensagemFormatada);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-ink">
      <Sidebar onNovoChat={() => setMensagens([])} />
      <ChatArea
        mensagens={mensagens}
        sugestoes={sugestoes}
        onEnviar={enviar}
        carregando={gerandoResposta}
      />
      <RightPanel
        jornada={jornada}
        xp={620}
        nivel={7}
        onAbrirPratica={() => setDrawerAberto(true)}
      />

      <CodeValidatorDrawer
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        onEnviarAoTutor={handleEnviarAoTutor}
      />
    </div>
  );
}
