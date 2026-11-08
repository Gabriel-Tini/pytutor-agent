export type SkillStatus = "bloqueado" | "refinando" | "dominado";

export interface Skill {
  id: string;
  titulo: string;
  fase: number;
  status: SkillStatus;
  progresso: number; // 0..100
  descricao: string;
}

export interface Mensagem {
  id: string;
  autor: "aluno" | "tutor";
  texto: string; // markdown (suporta ```python e LaTeX $...$)
}

export interface ObsidianState {
  checkpoints_dir: string;
  ultimo_checkpoint_id: string;
  proximo_checkpoint_id: string;
  ultimo_checkpoint_md: string;
  proximo_passo: string;
  checkpoints_concluidos: string[];
}

/** Currículo completo das 5 Fases para a Neural Skill Tree e lista da Jornada */
export const curriculoCompleto: Skill[] = [
  // Fase 1
  { id: "001", titulo: "Variáveis e Memória (CPython)", fase: 1, status: "refinando", progresso: 25, descricao: "Alocação PyObject, id(), ponteiros e tipagem dinâmica." },
  { id: "002", titulo: "Loops como Somatórios (Σ)", fase: 1, status: "bloqueado", progresso: 0, descricao: "Tradução de somatórios e produtórios matemáticos para for/while." },
  { id: "003", titulo: "Vetores 1D & Matrizes 2D", fase: 1, status: "bloqueado", progresso: 0, descricao: "Álgebra de índices [i][j], tuplas como shapes e dicionários." },
  // Fase 2
  { id: "004", titulo: "Generators & Batches (yield)", fase: 2, status: "bloqueado", progresso: 0, descricao: "Streaming de dados na RAM sem estouro de memória (OOM)." },
  { id: "005", titulo: "POO & Dunder Methods", fase: 2, status: "bloqueado", progresso: 0, descricao: "Arquitetura de camadas: __init__, __call__, __matmul__ (@)." },
  // Fase 3
  { id: "006", titulo: "Álgebra Linear & Dot Product", fase: 3, status: "bloqueado", progresso: 0, descricao: "Produto escalar, transposta, Norma L2 e Similaridade de Cosseno." },
  { id: "007", titulo: "Cálculo & Gradiente (∇)", fase: 3, status: "bloqueado", progresso: 0, descricao: "Derivadas parciais ∂L/∂w e Regra da Cadeia analítica." },
  // Fase 4
  { id: "008", titulo: "Regressão Linear & Gradient Descent", fase: 4, status: "bloqueado", progresso: 0, descricao: "MSE Loss, atualização de pesos e hiperparâmetro Learning Rate." },
  { id: "009", titulo: "Classificação & Cross-Entropy", fase: 4, status: "bloqueado", progresso: 0, descricao: "Regressão Logística, Sigmoid e prevenção de Data Leakage." },
  // Fase 5
  { id: "010", titulo: "MLP & Backpropagation do Zero", fase: 5, status: "bloqueado", progresso: 0, descricao: "Forward Pass, ReLU/Softmax e retropropagação matricial." },
  { id: "011", titulo: "PyTorch, Autograd & Attention", fase: 5, status: "bloqueado", progresso: 0, descricao: "Tensores na GPU, nn.Module, DataLoader e Self-Attention." },
];

export const mensagensIniciais: Mensagem[] = [
  {
    id: "m1",
    autor: "aluno",
    texto: "Iniciar trilha socrática na Fase 1.1 (Zero Caixa-Preta).",
  },
  {
    id: "m2",
    autor: "tutor",
    texto: `### 🎓 [Fase 1.1]: Variáveis, Ponteiros e Alocação de Memória em CPython

**2. 🧠 Fundamento de Python & Conexão com IA:**
Em Python, variáveis **não são caixas** que guardam valores; são **rótulos (ponteiros)** que apontam para estruturas \`PyObject\` alocadas no Heap da memória RAM. Em Deep Learning, compreender se duas variáveis apontam para o mesmo endereço (\`id(x) == id(y)\`) evita corromper tensores de pesos durante o treinamento in-place.

**3. 📐 Dedução Matemática Passo a Passo:**
Seja um vetor de pesos $w \\in \\mathbb{R}^d$. Uma atribuição direta $v = w$ não copia o vetor ($O(1)$ em memória, mesmo endereço $\\text{addr}(v) = \\text{addr}(w)$), enquanto uma cópia explícita aloca um novo bloco contíguo ($O(d)$ em memória, $\\text{addr}(v) \\neq \\text{addr}(w)$).

**4. 💻 Tradução Linha a Linha para Python:**
\`\`\`python
w = [0.5, -1.2, 0.8]  # Aloca lista no Heap
v = w                 # v aponta para o MESMO endereço de w
copia = w.copy()      # Aloca NOVO vetor independente

print(id(w) == id(v))      # True (mesmo objeto!)
print(id(w) == id(copia))  # False (objetos distintos)
\`\`\`

**5. ⚡ Desafio Prático Local:**
Clique em **"Vamos praticar?"** abaixo para abrir o Validador Local. Complete a função \`atualizar_pesos_seguro(pesos, delta)\` para que ela retorne uma **nova lista** com cada peso somado a \`delta\`, **sem modificar** a lista original \`pesos\` passada como argumento!`,
  },
];

export const sugestoes = [
  "Vamos praticar?",
  "Explique melhor o PyObject na RAM",
  "/checkpoint",
];
