import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Sidebar, type AbaMenu } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { RightPanel } from "./components/RightPanel";
import { CodeValidatorDrawer } from "./components/CodeValidatorDrawer";
import { NeuralSkillTreeModal } from "./components/NeuralSkillTreeModal";
import { ProjectsModal } from "./components/ProjectsModal";
import { AchievementsModal } from "./components/AchievementsModal";
import {
  curriculoCompleto,
  mensagensIniciais,
  sugestoes,
  type Mensagem,
  type ObsidianState,
  type Skill,
} from "./data";
import { streamTutorChat } from "./gemini";

export default function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensIniciais);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [skillTreeAberta, setSkillTreeAberta] = useState(false);
  const [projetosAberto, setProjetosAberto] = useState(false);
  const [conquistasAberta, setConquistasAberta] = useState(false);
  const [skills, setSkills] = useState<Skill[]>(curriculoCompleto);
  const [obsidian, setObsidian] = useState<ObsidianState | null>(null);
  const [xp, setXp] = useState(620);
  const [nivel, setNivel] = useState(7);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [gerandoResposta, setGerandoResposta] = useState(false);

  const sincronizarObsidian = async () => {
    try {
      const state = await invoke<ObsidianState>("get_obsidian_state");
      setObsidian(state);

      const concluidosNums = new Set(
        state.checkpoints_concluidos.map((stem) => stem.split("_")[0])
      );

      // Grafo de desbloqueio hierárquico:
      // 1. Se está em concluidosNums -> "dominado" (100%)
      // 2. Senão, se não tem pais (raiz) OU todos os seus pais estão em concluidosNums -> "refinando" (desbloqueado!)
      // 3. Caso contrário -> "bloqueado" (0%)
      setSkills((prev) =>
        prev.map((s) => {
          if (concluidosNums.has(s.id)) {
            return { ...s, status: "dominado", progresso: 100 };
          }
          const paisDominados =
            s.parents.length === 0 || s.parents.every((pId) => concluidosNums.has(pId));
          if (paisDominados) {
            return { ...s, status: "refinando", progresso: Math.max(s.progresso, 30) };
          }
          return { ...s, status: "bloqueado", progresso: 0 };
        })
      );

      const qtdDominados = concluidosNums.size;
      if (qtdDominados > 0) {
        setXp(620 + qtdDominados * 150);
        setNivel(7 + Math.floor((620 + qtdDominados * 150) / 1000));
      }
    } catch {
      // Fallback caso rode fora do Tauri
    }
  };

  useEffect(() => {
    sincronizarObsidian();
  }, []);

  const handleSelecionarMenu = (aba: AbaMenu) => {
    if (aba === "jornada") {
      setSkillTreeAberta(true);
    } else if (aba === "desafios") {
      setDrawerAberto(true);
    } else if (aba === "projetos") {
      setProjetosAberto(true);
    } else if (aba === "conquistas") {
      setConquistasAberta(true);
    } else if (aba === "configuracoes") {
      const novaChave = window.prompt("Configurar GEMINI_API_KEY (Modelo: gemini-3.6-flash):", apiKey);
      if (novaChave !== null) {
        localStorage.setItem("GEMINI_API_KEY", novaChave.trim());
        setApiKey(novaChave.trim());
      }
    }
  };

  const enviar = async (texto: string) => {
    const novaMensagemAluno: Mensagem = { id: crypto.randomUUID(), autor: "aluno", texto };
    const historicoAtual = [...mensagens, novaMensagemAluno];
    setMensagens(historicoAtual);

    if (texto.toLowerCase().includes("praticar") || texto.toLowerCase().includes("desafio")) {
      setDrawerAberto(true);
    }

    let chaveAtiva = apiKey.trim() || localStorage.getItem("GEMINI_API_KEY") || "";
    if (!chaveAtiva) {
      const chavePrompt = window.prompt("Por favor, insira sua GEMINI_API_KEY para conversar com o Tutor:");
      if (chavePrompt) {
        chaveAtiva = chavePrompt.trim();
        localStorage.setItem("GEMINI_API_KEY", chaveAtiva);
        setApiKey(chaveAtiva);
      } else {
        return;
      }
    }

    setGerandoResposta(true);
    const tutorId = crypto.randomUUID();
    setMensagens((ms) => [...ms, { id: tutorId, autor: "tutor", texto: "..." }]);

    try {
      const dataAtual = new Date().toISOString().slice(0, 10);
      const comando = texto.trim() === "/checkpoint" ? "/checkpoint" : "ESTUDO";
      const payloadContextual = `<session_payload>
  <caminho_destino_md>${obsidian?.checkpoints_dir || "D:/Obsidian/IA e Aprendizado de Maquina/Checkpoints"}</caminho_destino_md>
  <data_atual>${dataAtual}</data_atual>
  <ultimo_checkpoint_md>${obsidian?.ultimo_checkpoint_md || "NENHUM"}</ultimo_checkpoint_md>
  <comando>${comando}</comando>
  <mensagem_aluno>${texto}</mensagem_aluno>
</session_payload>`;

      let textoAcumulado = "";
      for await (const chunk of streamTutorChat(chaveAtiva, historicoAtual, payloadContextual)) {
        textoAcumulado += chunk;
        setMensagens((prev) =>
          prev.map((m) => (m.id === tutorId ? { ...m, texto: textoAcumulado } : m))
        );
      }

      if (
        textoAcumulado.includes("<<<START_CHECKPOINT_FILE>>>") &&
        textoAcumulado.includes("<<<END_CHECKPOINT_FILE>>>")
      ) {
        try {
          const caminhoSalvo = await invoke<string>("save_checkpoint_block", {
            rawText: textoAcumulado,
          });
          setMensagens((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              autor: "tutor",
              texto: `✅ **Checkpoint gravado automaticamente no Obsidian!**\nArquivo salvo em: \`${caminhoSalvo}\`\n\nNovos nós filhos foram desbloqueados na sua **Árvore de Grafos Neural** (+150 XP)!`,
            },
          ]);
          await sincronizarObsidian();
        } catch (errSalvar) {
          setMensagens((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              autor: "tutor",
              texto: `⚠️ Não foi possível gravar o checkpoint no disco: ${String(errSalvar)}`,
            },
          ]);
        }
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
    if (output.includes("exit_code: 0")) {
      setSkills((prev) =>
        prev.map((s) => (s.status === "refinando" ? { ...s, progresso: 90 } : s))
      );
    }
    const mensagemFormatada = `Submissão de Código para Auditoria Socrática:\n\n\`\`\`python\n${codigo}\n\`\`\`\n\n**Saída do Terminal Local (Python):**\n\`\`\`text\n${output}\n\`\`\``;
    enviar(mensagemFormatada);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-ink">
      <Sidebar onNovoChat={() => setMensagens(mensagensIniciais)} onSelecionarMenu={handleSelecionarMenu} />
      <ChatArea
        mensagens={mensagens}
        sugestoes={sugestoes}
        onEnviar={enviar}
        carregando={gerandoResposta}
      />
      <RightPanel
        jornada={skills}
        xp={xp}
        nivel={nivel}
        onAbrirPratica={() => setDrawerAberto(true)}
        onAbrirSkillTree={() => setSkillTreeAberta(true)}
        onAbrirConquistas={() => setConquistasAberta(true)}
      />

      <CodeValidatorDrawer
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        onEnviarAoTutor={handleEnviarAoTutor}
      />

      <NeuralSkillTreeModal
        aberto={skillTreeAberta}
        onFechar={() => setSkillTreeAberta(false)}
        skills={skills}
        obsidian={obsidian}
        onSelecionarSkill={(skill) => {
          enviar(`Quero estudar o tópico #${skill.id}: ${skill.titulo}`);
        }}
      />

      <ProjectsModal
        aberto={projetosAberto}
        onFechar={() => setProjetosAberto(false)}
        skills={skills}
        onIniciarProjeto={(proj) => {
          setDrawerAberto(true);
          enviar(`Quero iniciar o projeto prático: "${proj.titulo}". Me passe o roteiro socrático e os casos de assert!`);
        }}
      />

      <AchievementsModal
        aberto={conquistasAberta}
        onFechar={() => setConquistasAberta(false)}
        skills={skills}
        xp={xp}
        nivel={nivel}
      />
    </div>
  );
}
