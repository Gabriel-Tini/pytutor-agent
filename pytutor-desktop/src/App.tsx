import { useState } from "react";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { RightPanel } from "./components/RightPanel";
import { jornada, mensagensIniciais, sugestoes, type Mensagem } from "./data";

export default function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensIniciais);

  const enviar = (texto: string) =>
    setMensagens((ms) => [...ms, { id: crypto.randomUUID(), autor: "aluno", texto }]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink">
      <Sidebar onNovoChat={() => setMensagens([])} />
      <ChatArea mensagens={mensagens} sugestoes={sugestoes} onEnviar={enviar} />
      <RightPanel jornada={jornada} xp={620} nivel={7} />
    </div>
  );
}
