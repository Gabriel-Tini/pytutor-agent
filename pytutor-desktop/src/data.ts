export type SkillStatus = "bloqueado" | "refinando" | "dominado";

export interface Skill {
  id: string;
  titulo: string;
  fase: 1 | 2 | 3 | 4 | 5; // Fase Curricular oficial do plano
  nivelGrafo: number; // Profundidade real de pré-requisito na árvore (1..12)
  status: SkillStatus;
  progresso: number; // 0..100
  descricao: string;
  parents: string[]; // IDs dos conceitos que precisam estar dominados para liberar este
}

export interface ProjetoPratico {
  id: string;
  titulo: string;
  faseRequerida: number;
  requisitoSkillId: string;
  descricao: string;
  entregavel: string;
  xpRecompensa: number;
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: "code" | "flame" | "book" | "trophy" | "cpu" | "sparkles";
  xpBonus: number;
  requisitoCheckpoints: number;
}

export interface Mensagem {
  id: string;
  autor: "aluno" | "tutor";
  texto: string;
}

export interface ObsidianState {
  checkpoints_dir: string;
  ultimo_checkpoint_id: string;
  proximo_checkpoint_id: string;
  ultimo_checkpoint_md: string;
  proximo_passo: string;
  checkpoints_concluidos: string[];
}

export const FASES_CURRICULARES: Record<number, { titulo: string; subtitulo: string }> = {
  1: { titulo: "FASE 1", subtitulo: "Python Básico com Mentalidade de Dados" },
  2: { titulo: "FASE 2", subtitulo: "Python Intermediário/Avançado para IA" },
  3: { titulo: "FASE 3", subtitulo: "Matemática Computacional & Vetorização" },
  4: { titulo: "FASE 4", subtitulo: "Machine Learning Clássico" },
  5: { titulo: "FASE 5", subtitulo: "Deep Learning & Redes Neurais" },
};

/**
 * Currículo Oficial Completo (24 Conceitos Atômicos nas 5 Fases).
 * Cada nó só é desbloqueado quando TODOS os seus pré-requisitos pedagógicos (`parents`)
 * forem dominados pelo aluno.
 */
export const curriculoCompleto: Skill[] = [
  // =========================================================================
  // FASE 1: PYTHON BÁSICO COM MENTALIDADE DE DADOS
  // =========================================================================
  {
    id: "001",
    titulo: "Variáveis, Memória & id()",
    fase: 1,
    nivelGrafo: 1,
    status: "refinando",
    progresso: 30,
    descricao: "Alocação PyObject no Heap, ponteiros, referências e mutabilidade.",
    parents: [],
  },
  {
    id: "002",
    titulo: "Tipos Primitivos & Operadores",
    fase: 1,
    nivelGrafo: 2,
    status: "bloqueado",
    progresso: 0,
    descricao: "int, float (IEEE 754), bool, str e operadores aritméticos/lógicos.",
    parents: ["001"],
  },
  {
    id: "003",
    titulo: "Saída, print() & f-strings",
    fase: 1,
    nivelGrafo: 2,
    status: "bloqueado",
    progresso: 0,
    descricao: "Inspeção de variáveis, formatação de precisão numérica e logs.",
    parents: ["001"],
  },
  {
    id: "004",
    titulo: "Condicionais (if / elif / else)",
    fase: 1,
    nivelGrafo: 3,
    status: "bloqueado",
    progresso: 0,
    descricao: "Álgebra booleana, tabelas-verdade, guard clauses e ramificação.",
    parents: ["002", "003"],
  },
  {
    id: "005",
    titulo: "Listas (Vetores 1D) & Slicing",
    fase: 1,
    nivelGrafo: 3,
    status: "bloqueado",
    progresso: 0,
    descricao: "Arrays dinâmicos de ponteiros, indexação [i], fatiamento e cópias.",
    parents: ["002", "003"],
  },
  {
    id: "006",
    titulo: "Loops (for/while como Somatórios Σ)",
    fase: 1,
    nivelGrafo: 4,
    status: "bloqueado",
    progresso: 0,
    descricao: "Acumuladores, complexidade O(n) e tradução de Σ e Π para código.",
    parents: ["004", "005"],
  },
  {
    id: "007",
    titulo: "Matrizes 2D (Listas Aninhadas [i][j])",
    fase: 1,
    nivelGrafo: 4,
    status: "bloqueado",
    progresso: 0,
    descricao: "Representação de tabelas/tensores 2D e navegação linha-coluna.",
    parents: ["005"],
  },
  {
    id: "008",
    titulo: "Tuplas (Shapes) & Dicts (JSON)",
    fase: 1,
    nivelGrafo: 4,
    status: "bloqueado",
    progresso: 0,
    descricao: "Imutabilidade de dimensões (H, W, C) e tabelas Hash O(1) para configs.",
    parents: ["005"],
  },
  {
    id: "009",
    titulo: "Funções (def) & try/except",
    fase: 1,
    nivelGrafo: 5,
    status: "bloqueado",
    progresso: 0,
    descricao: "Escopo local/global, parâmetros, retorno e tratamento robusto de erros.",
    parents: ["006", "007", "008"],
  },

  // =========================================================================
  // FASE 2: PYTHON INTERMEDIÁRIO/AVANÇADO PARA IA
  // =========================================================================
  {
    id: "010",
    titulo: "Comprehensions & Funções Lambda",
    fase: 2,
    nivelGrafo: 6,
    status: "bloqueado",
    progresso: 0,
    descricao: "Transformação declarativa de vetores/dicionários e funções anônimas.",
    parents: ["009"],
  },
  {
    id: "011",
    titulo: "Iteradores & Generators (yield)",
    fase: 2,
    nivelGrafo: 6,
    status: "bloqueado",
    progresso: 0,
    descricao: "Avaliação preguiçosa (lazy) para streaming de mini-batches na RAM.",
    parents: ["009"],
  },
  {
    id: "012",
    titulo: "POO: Classes de Modelos & Camadas",
    fase: 2,
    nivelGrafo: 6,
    status: "bloqueado",
    progresso: 0,
    descricao: "Encapsulamento de estado (pesos/bias), herança e métodos de treino.",
    parents: ["009"],
  },
  {
    id: "013",
    titulo: "Dunder Methods (__call__, __matmul__)",
    fase: 2,
    nivelGrafo: 7,
    status: "bloqueado",
    progresso: 0,
    descricao: "Protocolos internos do Python: __init__, __len__, __getitem__ e @.",
    parents: ["011", "012"],
  },
  {
    id: "014",
    titulo: "Decorators, Context Managers & Types",
    fase: 2,
    nivelGrafo: 7,
    status: "bloqueado",
    progresso: 0,
    descricao: "Wrappers de tempo/gradiente (with no_grad) e Type Hints estritos.",
    parents: ["010", "012"],
  },

  // =========================================================================
  // FASE 3: MATEMÁTICA COMPUTACIONAL & VETORIZAÇÃO
  // =========================================================================
  {
    id: "015",
    titulo: "Álgebra Linear: Dot Product & Norma L2",
    fase: 3,
    nivelGrafo: 8,
    status: "bloqueado",
    progresso: 0,
    descricao: "Produto escalar, multiplicação matricial, transposta e Cosseno.",
    parents: ["007", "013"],
  },
  {
    id: "016",
    titulo: "Cálculo: Derivadas Parciais & Cadeia",
    fase: 3,
    nivelGrafo: 8,
    status: "bloqueado",
    progresso: 0,
    descricao: "Limites, taxa de variação ∂L/∂w e Regra da Cadeia passo a passo.",
    parents: ["010", "014"],
  },
  {
    id: "017",
    titulo: "Gradiente (∇) & Vetorização NumPy",
    fase: 3,
    nivelGrafo: 9,
    status: "bloqueado",
    progresso: 0,
    descricao: "Refatoração de loops Python puro para arrays C contíguos e Pandas.",
    parents: ["015", "016"],
  },

  // =========================================================================
  // FASE 4: MACHINE LEARNING CLÁSSICO
  // =========================================================================
  {
    id: "018",
    titulo: "Regressão Linear, MSE & Gradient Descent",
    fase: 4,
    nivelGrafo: 10,
    status: "bloqueado",
    progresso: 0,
    descricao: "Otimização analítica do Erro Quadrático Médio e Learning Rate.",
    parents: ["017"],
  },
  {
    id: "019",
    titulo: "Regressão Logística & Cross-Entropy",
    fase: 4,
    nivelGrafo: 10,
    status: "bloqueado",
    progresso: 0,
    descricao: "Classificação binária, Sigmoid, verossimilhança e perda logarítmica.",
    parents: ["017"],
  },
  {
    id: "020",
    titulo: "Árvores, K-Means, SVM & Validação",
    fase: 4,
    nivelGrafo: 11,
    status: "bloqueado",
    progresso: 0,
    descricao: "Prevenção de Data Leakage, Cross-Validation, métricas e Scikit-Learn.",
    parents: ["018", "019"],
  },

  // =========================================================================
  // FASE 5: DEEP LEARNING & REDES NEURAIS
  // =========================================================================
  {
    id: "021",
    titulo: "Perceptron, MLP & Ativações (ReLU/Softmax)",
    fase: 5,
    nivelGrafo: 11,
    status: "bloqueado",
    progresso: 0,
    descricao: "Forward Pass matricial e não-linearidades com suas derivadas exatas.",
    parents: ["018", "019"],
  },
  {
    id: "022",
    titulo: "Backpropagation do Zero (Regra da Cadeia)",
    fase: 5,
    nivelGrafo: 12,
    status: "bloqueado",
    progresso: 0,
    descricao: "Retropropagação do erro camada a camada em Python/NumPy puro.",
    parents: ["020", "021"],
  },
  {
    id: "023",
    titulo: "PyTorch: Tensor, Autograd & nn.Module",
    fase: 5,
    nivelGrafo: 13,
    status: "bloqueado",
    progresso: 0,
    descricao: "Grafos dinâmicos de computação, DataLoader, otimizadores e GPU.",
    parents: ["022"],
  },
  {
    id: "024",
    titulo: "CNNs, RNNs & Self-Attention (Transformers)",
    fase: 5,
    nivelGrafo: 14,
    status: "bloqueado",
    progresso: 0,
    descricao: "Convoluções, estados recorrentes e mecanismo Q, K, V de Atenção.",
    parents: ["023"],
  },
];

export const catalogoProjetos: ProjetoPratico[] = [
  {
    id: "p1",
    titulo: "Motor de Matrizes 2D em Python Puro (TinyMatrix)",
    faseRequerida: 1,
    requisitoSkillId: "009",
    descricao: "Construa um módulo de manipulação de vetores e matrizes usando apenas listas, tuplas (shapes), loops e funções tratadas com try/except.",
    entregavel: "Módulo validado com operações de soma, busca e verificação de shape.",
    xpRecompensa: 250,
  },
  {
    id: "p2",
    titulo: "DataLoader Gerador Lazy contra OOM",
    faseRequerida: 2,
    requisitoSkillId: "013",
    descricao: "Construa um pipeline de mini-batches usando yield e dunder methods (__iter__, __len__, __getitem__) capaz de fatiar datasets sem estourar a RAM.",
    entregavel: "Classe BatchLoader com consumo constante O(B) na memória.",
    xpRecompensa: 300,
  },
  {
    id: "p3",
    titulo: "Buscador Semântico por Cosseno L2",
    faseRequerida: 3,
    requisitoSkillId: "017",
    descricao: "Crie um motor de busca vetorial calculando produto escalar, norma L2 e similaridade de cosseno em Python puro e depois vetorizado em NumPy.",
    entregavel: "Ranking Top-K preciso com benchmark de speedup Python vs NumPy.",
    xpRecompensa: 400,
  },
  {
    id: "p4",
    titulo: "Classificador & Regressor sem Caixa-Preta",
    faseRequerida: 4,
    requisitoSkillId: "020",
    descricao: "Implemente Regressão Linear e Logística com Gradient Descent do zero, validação cruzada sem Data Leakage e comparação com Scikit-Learn.",
    entregavel: "Pipeline completo atingindo >92% de F1-Score em dados reais.",
    xpRecompensa: 500,
  },
  {
    id: "p5",
    titulo: "Rede Neural MLP & Attention do Zero ao PyTorch",
    faseRequerida: 5,
    requisitoSkillId: "024",
    descricao: "Construa uma MLP com Backpropagation analítico em NumPy e depois migre para PyTorch com bloco de Self-Attention.",
    entregavel: "Rede treinada resolvendo problema não-linear + camada de Atenção.",
    xpRecompensa: 800,
  },
];

export const catalogoConquistas: Conquista[] = [
  {
    id: "c1",
    titulo: "Mestre dos Ponteiros",
    descricao: "Dominou a mecânica de PyObject e alocação de memória no CPython (Checkpoint #001).",
    icone: "code",
    xpBonus: 100,
    requisitoCheckpoints: 1,
  },
  {
    id: "c2",
    titulo: "Fundação de Dados Sólida",
    descricao: "Concluiu todos os 9 módulos da Fase 1 (de Variáveis a Funções e Matrizes 2D).",
    icone: "flame",
    xpBonus: 250,
    requisitoCheckpoints: 9,
  },
  {
    id: "c3",
    titulo: "Engenheiro Pythonico de IA",
    descricao: "Dominou a Fase 2 completa: Comprehensions, Generators, POO e Dunder Methods (14 checkpoints).",
    icone: "book",
    xpBonus: 400,
    requisitoCheckpoints: 14,
  },
  {
    id: "c4",
    titulo: "Senhor do Gradiente & ML (∇)",
    descricao: "Deduziu derivadas parciais, vetorizou com NumPy e dominou o ML Clássico (20 checkpoints).",
    icone: "cpu",
    xpBonus: 600,
    requisitoCheckpoints: 20,
  },
  {
    id: "c5",
    titulo: "Iluminação Neural (Zero Caixa-Preta)",
    descricao: "Dominou todos os 24 conceitos atômicos da Árvore até Backpropagation, PyTorch e Transformers.",
    icone: "trophy",
    xpBonus: 1000,
    requisitoCheckpoints: 24,
  },
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
Em Python, variáveis **não são caixas** que guardam valores; são **rótulos (ponteiros)** que apontam para estruturas \`PyObject\` alocadas no Heap da memória RAM. Ao dominar como criar e inspecionar variáveis com \`id()\`, você desbloqueará na sua Árvore os dois próximos passos diretos: **Tipos Primitivos & Operadores (#002)** e **Saída, print() & f-strings (#003)**.

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
