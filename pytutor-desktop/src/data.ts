export type SkillStatus = "bloqueado" | "refinando" | "dominado";

export interface Skill {
  id: string;
  titulo: string;
  fase: number;
  status: SkillStatus;
  progresso: number; // 0..100
}

export interface Mensagem {
  id: string;
  autor: "aluno" | "tutor";
  texto: string; // markdown (suporta ```python e LaTeX $...$)
}

/** Blocos da trilha (dados de exemplo até a integração com o Obsidian). */
export const jornada: Skill[] = [
  { id: "1.1", titulo: "Variáveis e Memória", fase: 1, status: "dominado", progresso: 100 },
  { id: "1.2", titulo: "Estruturas de Controle", fase: 1, status: "dominado", progresso: 100 },
  { id: "1.3", titulo: "Funções em Python", fase: 1, status: "refinando", progresso: 45 },
  { id: "1.4", titulo: "Listas como Vetores 1D", fase: 1, status: "bloqueado", progresso: 0 },
];

export const mensagensIniciais: Mensagem[] = [
  { id: "m1", autor: "aluno", texto: "Pode me explicar o que é uma função em Python com um exemplo prático?" },
  {
    id: "m2",
    autor: "tutor",
    texto:
      "Claro! Em **Python, uma função** é um bloco de código que executa uma tarefa específica, podendo receber parâmetros e retornar um resultado. Matematicamente, é um mapeamento $f: X \\to Y$.\n\n```python\ndef saudacao(nome):\n    return f\"Olá, {nome}!\"\n\nprint(saudacao(\"Dev\"))  # Saída: Olá, Dev!\n```\n\nNesse exemplo, a **função `saudacao`** recebe um nome e retorna uma mensagem personalizada. Quer tentar criar sua própria função?",
  },
];

export const sugestoes = ["E se eu precisar de mais parâmetros?", "Mostre outro exemplo", "Vamos praticar?"];
