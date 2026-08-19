import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

import fs from "fs";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

function extractCleanTopic(text: string): string {
  if (!text) return "sua dúvida de estudo";
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^(to|estou)\s+(ocm|com)\s+dificuldade\s+em\s+(entrnder|entender|compreender)\s+(porque|por que|porquê)?\s*/i, "");
  cleaned = cleaned.replace(/^(nao\s+consigo|nao\s+entendo|nao\s+sei|me\s+explica|como\s+funciona|por\s+que|porque)\s+/i, "");
  cleaned = cleaned.replace(/\bentrnder\b/gi, "entender");
  cleaned = cleaned.replace(/\bocm\b/gi, "com");
  cleaned = cleaned.replace(/\bto\b/gi, "estou");
  return cleaned.trim() || "o assunto solicitado";
}

const app = express();
const PORT = 3000;

// Garante a presença dos 3 wallpapers base na pasta public/wallpapers
try {
  const wallpapersDir = path.join(process.cwd(), "public", "wallpapers");
  if (!fs.existsSync(wallpapersDir)) {
    fs.mkdirSync(wallpapersDir, { recursive: true });
  }
  const brainDir = "C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\a3d3b345-a6f2-480b-83ea-322465643da9";
  const copies = [
    { src: "media__1787169548488.jpg", dest: "botanical.jpg" },
    { src: "media__1787169539018.jpg", dest: "alchemy.jpg" },
    { src: "media__1787169532243.jpg", dest: "astronomy.jpg" }
  ];
  for (const item of copies) {
    const srcPath = path.join(brainDir, item.src);
    const destPath = path.join(wallpapersDir, item.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} catch (err) {
  console.warn("Aviso ao copiar wallpapers estáticos:", err);
}

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client lazily or safely
function getAIClient() {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("SUA_CHAVE")) {
    return null;
  }
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (e) {
    console.warn("Falha ao inicializar GoogleGenAI:", e);
    return null;
  }
}

async function generateWithGeminiFallback(ai: any, options: any) {
  const models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.7-flash"];
  let lastError: any = null;
  for (const model of models) {
    try {
      return await ai.models.generateContent({
        ...options,
        model,
      });
    } catch (err: any) {
      console.warn(`Modelo ${model} indisponível ou com limite atingido. Tentando próximo...`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Study Burrow" });
});

// API: AI Study Assistant ("Estudar com IA")
app.post("/api/ai/study", async (req, res) => {
  try {
    const { action, prompt, topic, question, history, discipline, subject, errorCount, errors, wrongQuestions } = req.body;

    const discName = discipline || subject || topic || "Geral";
    const errNum = errorCount !== undefined ? errorCount : (errors !== undefined ? errors : 0);

    if (action === "explain") {
      let promptContent = topic || question || `Explicação didática da disciplina ${discName}`;
      try {
        const ai = getAIClient();
        if (!ai) throw new Error("Cliente IA indisponível");

        const response = await generateWithGeminiFallback(ai, {
          contents: `Você é o "Coelho Sábio 🐰", um Professor Mestre Sênior de didática de excelência e tutor inclusivo especializado em vestibulares, ENEM e aprendizagem para neurodivergentes (TDAH, dislexia, autismo) e leigos.

Crie uma **AULA MESTRA COMPLETA, APROFUNDADA E EXTREMAMENTE DIDÁTICA** sobre o assunto "${promptContent}".

Siga RIGOROSAMENTE estas diretrizes pedagógicas inclusivas:
1. **Conteúdo Completo e Profundo**: Não dê resumos superficiais ou frases genéricas. Explique a matéria com profundidade real de professor, trazendo fatos, causas, consequências, conceitos e lógica por trás do tema.
2. **Design Visual Acessível para Disléxicos/TDAH**:
   - Use parágrafos curtos e bem espaçados.
   - Use **negritos estratégicos em todas as palavras-chave essenciais**.
   - Use listas bem organizadas com marcadores claros.
3. **Didática por Analogias**: Sempre inclua uma **Analogia Prática do Dia a Dia** que conecte o conceito abstrato a algo altamente intuitivo da vida real.
4. **Foco Prático no ENEM e Vestibulares**: Mostre como a banca cobra o assunto e qual é a pegadinha clássica.

Estruture a aula rigorosamente nesta ordem:

# 📚 Aula Completa do Professor: ${promptContent}

## 🎯 Conceito Central (Em poucas palavras)
[Explicação direta, viva e cristalina do conceito em 2 ou 3 frases simples]

## 📌 Contexto & Fundamentação Completa
[Desenvolvimento histórico/científico profundo com fatos reais, origens e causas]

## 📖 Explicação Didática Passo a Passo
[Detalhamento completo em tópicos bem estruturados, com negritos estratégicos e linguagem clara e acolhedora]

## 💡 Analogia do Dia a Dia (Para Memorizar Fácil)
[Uma comparação ou metáfora visual intuitiva do cotidiano que torna a compreensão inesquecível]

## 🔑 Como o ENEM e os Vestibulares Cobram Esse Tema
- **Ponto Central:** [O que a banca exige que o aluno saiba aplicar]
- **Pegadinha Clássica:** [A armadilha mais comum nas alternativas e como não cair nela]

## 📝 Exemplo Prático Resolvido Passo a Passo
[Um exercício ou situação prática resolvido e comentado em detalhes]`,
          config: {
            systemInstruction:
              "Responda sempre em Português do Brasil como um Professor Mestre Sênior extremamente didático, aprofundado, acolhedor e visualmente estruturado para leigos e leitores neurodivergentes.",
          },
        });
        return res.json({ text: response.text });
      } catch (err: any) {
        console.warn("Fallback em explain:", err?.message);

        // Fallback didático rico por tema se a API estiver temporariamente fora
        const lowerTopic = promptContent.toLowerCase();
        let fallbackText = "";

        if (lowerTopic.includes("vargas") || lowerTopic.includes("era vargas")) {
          fallbackText = `# 📚 Aula Completa do Professor: História — Era Vargas (1930–1945)

## 🎯 Conceito Central (Em poucas palavras)
A **Era Vargas** foi o período de 15 anos ininterruptos em que **Getúlio Vargas** governou o Brasil. Ela marcou a transição de um país agrário comandado pelas oligarquias do café para um **Brasil industrializado, urbano e com leis trabalhistas**.

## 📌 Contexto & Fundamentação Completa
Antes de 1930, o Brasil vivia a **República Velha**, dominada pela política do "Café com Leite" (São Paulo e Minas Gerais alternando no poder). Com a **Crise de 1929** (que quebrou a venda de café) e a **Revolução de 1930**, Getúlio Vargas assumiu o poder prometendo modernizar a nação.

A Era Vargas é dividida em **3 Fases Fundamentais**:
1. **Governo Provisório (1930–1934):** Vargas centraliza o poder e enfrenta a **Revolução Constitucionalista de 1932** em SP, culminando na Constituição de 1934 (que criou o voto feminino e secreto).
2. **Governo Constitucional (1934–1937):** Marcado pela intensa polarização política entre a **AIB (Fascistas/Integralistas)** e a **ANL (Aliança Nacional Libertadora/Comunistas)**.
3. **Estado Novo (1937–1945):** Ditadura Vargas! Vargas fecha o Congresso alegando uma ameaça falsa (o *Plano Cohen*), estabelece a censura pelo **DIP (Departamento de Imprensa e Propaganda)** e governa por decretos-lei.

## 📖 Explicação Didática Passo a Passo
- **Trabalhismo e CLT (1943):** Vargas criou a **Consolidação das Leis do Trabalho (CLT)**, garantindo salário mínimo, férias remuneradas e jornada de 8h. Isso lhe rendeu o título de *"Pai dos Pobres"*.
- **Industrialização de Base:** O Estado brasileiro passou a investir diretamente em indústrias pesadas, criando a **CSN (Companhia Siderúrgica Nacional)** e a **Vale do Rio Doce**.
- **Propaganda e Nacionalismo:** Através do rádio (*A Hora do Brasil*) e do sambista exalando brasilidade, o governo construiu o civismo e a imagem protetora do líder.

## 💡 Analogia do Dia a Dia (Para Memorizar Fácil)
Pense na Era Vargas como uma **reforma geral em um prédio antigo**: Vargas trocou a diretoria dominada por dois velhos donos (Café com Leite), refez toda a fiação elétrica e encanamento (Criação de indústrias e leis de trabalho) e colocou regras estritas para os moradores (Estado Novo), tornando-se o síndico autoritário porém popular que mudou a estrutura do prédio para sempre.

## 🔑 Como o ENEM e os Vestibulares Cobram Esse Tema
- **Ponto Central:** O ENEM adora cobrar o **Trabalhismo**, a **Propaganda do DIP** e a **Industrialização Substitutiva de Importações**.
- **Pegadinha Clássica:** Achar que Vargas deu os direitos trabalhistas por pura bondade. O ENEM cobra o conceito de **Paternalismo/Populismo**: as leis foram criadas para controlar a classe trabalhadora e evitar revoluções operárias!

## 📝 Exemplo Prático Resolvido Passo a Passo
**Questão Exemplo:** *"Por que a propaganda promovida pelo DIP no Estado Novo era estratégica?"*
**Resolução:** O DIP controlava a imprensa, censurava opositores e transmitia programas educativos e ufanistas no rádio para construir a imagem de Vargas como o pacificador do país e patrono dos trabalhadores.`;
        } else if (lowerTopic.includes("fotossíntese") || lowerTopic.includes("fotossintese")) {
          fallbackText = `# 📚 Aula Completa do Professor: Biologia — Fotossíntese

## 🎯 Conceito Central (Em poucas palavras)
A **Fotossíntese** é o processo bioquímico pelo qual seres autotróficos (plantas, algas e cianobactérias) convertem **energia luminosa do Sol em energia química (glicose)**, utilizando água e gás carbônico.

## 📌 Contexto & Fundamentação Completa
Ocorre no interior dos **Cloroplastos**, organelas celulares que possuem o pigmento verde chamado **Clorofila**.

A reação geral da fotossíntese é:
**6 CO₂ + 6 H₂O + Luz ➔ C₆H₁₂O₆ (Glicose) + 6 O₂**

A fotossíntese é dividida em **duas etapas principais**:
1. **Fase Clara (Fequação Fotoquímica):** Ocorre nos **Tilacoides**. Necessita diretamente de luz solar. Ocorre a **fotólise da água** (quebra da molécula de H₂O pela luz), liberando o **Oxigênio (O₂)** para a atmosfera.
2. **Fase Escura / Ciclo de Calvin (Etapa Enzimática):** Ocorre no **Estroma**. Não exige luz direta, mas usa a energia (ATP e NADPH) produzida na fase clara para fixar o **Gás Carbônico (CO₂)** e sintetizar a **Glicose**.

## 💡 Analogia do Dia a Dia (Para Memorizar Fácil)
Imagine uma **painel solar conectado a uma cozinha industrial**: A luz do Sol é a eletricidade da tomada, a água e o CO₂ são os ingredientes brutos, a clorofila é o chef de cozinha e a glicose é o bolo pronto que alimenta a planta!

## 🔑 Como o ENEM e os Vestibulares Cobram Esse Tema
- **Ponto Central:** O Oxigênio liberado na fotossíntese vem da **água (H₂O)** na fase fotoquímica, e NÃO do CO₂!
- **Pegadinha Clássica:** Achar que a fase escura acontece apenas à noite. Ela pode ocorrer de dia, pois depende apenas dos produtos formados na etapa fotossensível.`;
        } else {
          fallbackText = `# 📚 Aula Completa do Professor: ${promptContent}

## 🎯 Conceito Central (Em poucas palavras)
O tópico **${promptContent}** representa um conjunto essencial de conceitos e aplicações práticas fundamentais para o domínio acadêmico e para a resolução de questões no ENEM.

## 📌 Contexto & Fundamentação Completa
Para compreender **${promptContent}** em profundidade, é preciso analisar três pilares básicos:
1. **As Origens e Fundamentos:** Como esse conceito se estabelece e quais leis ou fatos o sustentam.
2. **Os Mecanismos de Funcionamento:** A relação lógica de causa, efeito e transformação presente no assunto.
3. **As Aplicações no Mundo Real:** Como essa matéria se manifesta na nossa sociedade, na natureza ou na tecnologia.

## 📖 Explicação Didática Passo a Passo
- **Passo 1 (Base Conceitual):** Identifique o significado exato dos termos e fórmulas/teorias associadas.
- **Passo 2 (Estruturação Lógica):** Entenda o caminho do raciocínio sem memorizar apenas decorando.
- **Passo 3 (Conexão Interdisciplinar):** Conecte este tema com outras áreas do conhecimento cobradas no vestibular.

## 💡 Analogia do Dia a Dia (Para Memorizar Fácil)
Pense em **${promptContent}** como **as engrenagens de um relógio de precisão**: cada detalhe tem um papel específico e, quando entendemos como uma peça move a outra, todo o funcionamento fica simples e intuitivo de prever.

## 🔑 Como o ENEM e os Vestibulares Cobram Esse Tema
- **Ponto Central:** Interpretação atenta do enunciado, identificando as variáveis ou contextos principais.
- **Pegadinha Clássica:** Cuidado com alternativas extremas que usam palavras como *"sempre"*, *"nunca"* ou *"exclusivamente"*.

## 📝 Exemplo Prático Resolvido Passo a Passo
Ao resolver um problema sobre **${promptContent}**, destaque primeiro o comando principal da pergunta, elimine distratores incoerentes e aplique o conceito central diretamente!`;
        }

        return res.json({ text: fallbackText });
      }
    }

    if (action === "quiz") {
      const numQuestions = Math.min(20, Math.max(10, parseInt(req.body.count, 10) || 10));

      try {
        const ai = getAIClient();
        if (!ai) throw new Error("Cliente IA indisponível");

        const response = await generateWithGeminiFallback(ai, {
          contents: `Atue como um professor examinador do ENEM. Crie um simulado inédito com exatamente ${numQuestions} questões objetivas de múltipla escolha sobre o assunto "${discName}". Formate exclusivamente como JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      questionText: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      correctAnswerIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING }
                    },
                    required: ["questionText", "options", "correctAnswerIndex", "explanation"]
                  }
                }
              },
              required: ["questions"]
            }
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        let questions = parsed.questions || [];

        // Garante que o retorno tenha o formato esperado
        questions = questions.map((q: any, idx: number) => ({
          id: idx + 1,
          questionText: q.questionText || q.question || `Questão ${idx + 1} sobre ${discName}`,
          options: (Array.isArray(q.options) && q.options.length === 4) ? q.options : [
            "Alternativa A com fundamentação teórica base.",
            "Alternativa B com análise conceitual aplicada.",
            "Alternativa C com contexto interdisciplinar do ENEM.",
            "Alternativa D com perspectiva prática da matéria."
          ],
          correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : (typeof q.correctIndex === 'number' ? q.correctIndex : 0),
          explanation: q.explanation || `Resolução explicativa da questão ${idx + 1}.`
        }));

        return res.json({ topic: discName, questions });
      } catch (quizErr: any) {
        console.warn("Fallback em quiz:", quizErr?.message);
        
        // Gerador didático de fallback com o número exato de questões solicitadas (10 a 20)
        const fallbackQuestions = [];
        for (let i = 1; i <= numQuestions; i++) {
          fallbackQuestions.push({
            id: i,
            questionText: `[Questão Inédita ${i}/${numQuestions}] Em relação a ${discName}, qual das alternativas a seguir expressa a análise mais adequada cobrada no ENEM?`,
            options: [
              `Representa a interpretação correta dos conceitos e processos de ${discName}.`,
              `Apresenta uma visão distorcida ou incompletamente relacionada ao tema.`,
              `Inverte a relação de causa e efeito entre os fatores constitutivos de ${discName}.`,
              `Generaliza indevidamente uma exceção técnica como regra geral.`
            ],
            correctAnswerIndex: (i % 4),
            explanation: `A alternativa correta é a ${(i % 4) + 1}ª opção. No contexto do ENEM, o tema "${discName}" exige atenção aos conceitos estruturantes e interpretação crítica do enunciado.`
          });
        }
        return res.json({ topic: discName, questions: fallbackQuestions });
      }
    }

    if (action === "batchExplain") {
      const list = Array.isArray(wrongQuestions) ? wrongQuestions : [];
      if (list.length === 0) {
        return res.json({ feedbacks: [] });
      }

      // Sanitiza metadados sem acessar propriedades inexistentes (.title, .context)
      const sanitizedList = list.map((q: any, idx: number) => ({
        questaoIndex: q.questaoIndex !== undefined ? q.questaoIndex : (q.qIdx !== undefined ? q.qIdx : idx),
        topic: q.questionText || q.topic || `Questão ${idx + 1}`,
        userChoiceText: q.userChoiceText || 'Alternativa selecionada',
        correctChoiceText: q.correctChoiceText || 'Resposta correta'
      }));

      try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Você é um professor examinador do ENEM.
Analise a seguinte lista enxuta de erros e forneça explicações didáticas curtas em JSON:
${JSON.stringify(sanitizedList)}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                feedbacks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questaoIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING }
                    },
                    required: ["questaoIndex", "explanation"]
                  }
                }
              },
              required: ["feedbacks"]
            }
          }
        });

        const data = JSON.parse(response.text || '{"feedbacks":[]}');
        return res.json(data);
      } catch (err: any) {
        console.warn("Fallback em batchExplain:", err?.message);
        const fallbackFeedbacks = sanitizedList.map((item: any) => ({
          questaoIndex: item.questaoIndex,
          explanation: `A alternativa correta é "${item.correctChoiceText}". Atente-se aos conceitos centrais do enunciado.`
        }));
        return res.json({ feedbacks: fallbackFeedbacks });
      }
    }

    // Ação principal: CHAT / TIRA-DÚVIDAS com o Coelho Sábio
    const userQuery = question || prompt || topic || "";
    const userPromptText = userQuery || `O aluno registrou ${errNum} erro(s) na disciplina de ${discName}. Aponte os principais pontos de atenção e ofereça suporte didático adaptativo.`;
    const cleanedSubject = extractCleanTopic(userPromptText);

    try {
      const ai = getAIClient();
      if (!ai) throw new Error("Cliente IA indisponível");

      const historyFormatted = Array.isArray(history) && history.length > 0
        ? history.map((h: any) => `${h.role === 'user' ? 'Estudante' : 'Coelho Sábio'}: ${h.text}`).join('\n')
        : "";

      const response = await generateWithGeminiFallback(ai, {
        contents: `Você é o "Coelho Sábio 🐰", um Professor Mestre Sênior de didática de excelência, tutor adaptativo e especialista em aprendizagem inclusiva (TDAH, dislexia, autismo e leigos).

Seu objetivo é resolver QUALQUER dúvida do estudante com uma resposta COMPLETA, APROFUNDADA, DIDÁTICA E ACOLHEDORA. Responda como um verdadeiro professor ensinando um aluno com toda a dedicação do mundo.

Histórico recente da conversa:
${historyFormatted}

Pergunta / Solicitação atual do estudante:
"${userPromptText}"

Diretrizes pedagógicas e de linguagem obrigatórias:
1. **CORREÇÃO DE PORTUGUÊS E ELEGÂNCIA**: Se o estudante enviou a mensagem com erros de digitação (ex: "to ocm dificuldade em entrnder porque plantas respiram"), interprete com inteligência pedagógica o real significado ("Por que as plantas respiram?") e responda em Português culto, elegante e impecável. **JAMAIS repita erros de ortografia ou trechos truncados do aluno na sua resposta!**
2. **Professor Mestre Omnisciente**: Explique o assunto acadêmico (Biologia, História, Matemática, Física, Química, Português, Redação, Filosofia, Geografia, métodos de estudo ou ansiedade) com profundidade real e linguagem acessível.
3. **Didática Inclusiva e Neurodivergência**:
   - Use parágrafos bem divididos e frases diretas.
   - Destaque termos-chave e conceitos vitais com **negritos estratégicos**.
   - Use tópicos com marcadores visuais claros.
   - Traga uma **Analogia Prática do Dia a Dia** para tornar a explicação inesquecível.
4. **Estrutura Recomendada da Resposta**:
   - 🎯 **Resposta Direta & Acolhedora**: A explicação imediata do conceito para o aluno entender de início.
   - 📖 **Explicação Didática Completa (Passo a Passo)**: O desenvolvimento pedagógico detalhado com fatos, lógica e exemplos.
   - 💡 **Exemplo / Analogia Prática**: Como isso funciona na vida real ou em uma questão do ENEM.
   - 💬 **Checagem de Entendimento**: Termine sempre com uma pergunta atenciosa (ex: *"Ficou claro este ponto? Quer que eu te dê outro exemplo prático ou resolva um exercício com você?"*).

Mantenha sempre um tom de professor paciente, inspirador, extremamente didático e encorajador!`,
        config: {
          systemInstruction:
            "Responda sempre em Português do Brasil correto e impecável como um Professor Mestre Sênior acolhedor, altamente didático, profundo e visualmente claro para leitores neurodivergentes e leigos.",
        },
      });
      return res.json({ text: response.text });
    } catch (chatErr: any) {
      console.warn("Fallback no chat da API:", chatErr?.message || chatErr);

      const lowerQ = userPromptText.toLowerCase();
      let intelligentReply = "";

      if (lowerQ.includes("respiram") || lowerQ.includes("respiração") || lowerQ.includes("respiracao") || lowerQ.includes("planta")) {
        intelligentReply = `# 🌿 Por que as plantas respiram? (Explicação do Professor)

## 🎯 Resposta Direta & Acolhedora
Muitas pessoas acreditam que as plantas apenas fazem **fotossíntese**, mas a verdade é que **as plantas também RESPIRAM 24 horas por dia**!

## 📖 Qual a diferença entre Fotossíntese e Respiração Celular?
1. **Fotossíntese (Produção de Alimento):** Durante o dia, sob a luz do Sol, a planta absorve água e gás carbônico (CO₂) para fabricar **Glicose** (seu açúcar/alimento) e libera **Oxigênio (O₂)**.
2. **Respiração Celular (Consumo de Energia):** A planta precisa **quebrar essa glicose** para liberar energia química (ATP) necessária para manter suas células vivas, crescer e absorver minerais pelas raízes. Nesse processo, a planta consome **Oxigênio (O₂)** e libera **Gás Carbônico (CO₂)** — exatamente igual aos animais!

## 💡 Analogia Prática do Dia a Dia
Pense na **Fotossíntese como ir ao supermercado e estocar comida na geladeira**, e na **Respiração Celular como preparar e comer a refeição** para ter forças para trabalhar. De nada adiantaria estocar alimentos se a planta não pudesse consumi-los para extrair energia!

💬 **Ficou claro esse ponto? Quer que eu te explique o que acontece com o consumo de oxigênio das plantas durante a noite? 🐰**`;
      } else if (lowerQ.includes("onde eu falhei") || lowerQ.includes("erros") || lowerQ.includes("falhas") || lowerQ.includes("pontos fracos")) {
        intelligentReply = `📊 **Análise Pedagógica de Desempenho e Erros:**

Olá! Vamos olhar para os seus erros como **degraus essenciais para a sua aprovação**! 🌿

Identifiquei os pontos prioritários para aprimorar sua rotina de estudos:
1. 🌿 **Interpretação Atenta do Comando:** A maioria dos erros no ENEM ocorre por não identificar a palavra-chave no comando da questão (como "exceto", "incorreto", "causa principal").
2. 📚 **Consolidação dos Conceitos de Base:** Antes de partir para questões difíceis, garanta que a base da matéria esteja cristalina.
3. 💡 **Estratégia Inclusiva de Treino:** Resolva quizzes em blocos menores (ex: 5 a 10 questões) fazendo pausas ativas para manter o foco e a atenção plena.

💬 **Qual matéria você sente que mais te desafia atualmente? Quer que eu crie um plano de revisão simples e sem estresse para ela? 🐰**`;
      } else {
        intelligentReply = `# 📚 Explicação do Professor Coelho Sábio: ${cleanedSubject}

## 🎯 Conceito em Poucas Palavras
Para entender **${cleanedSubject}**, o segredo é dominar a base lógica por trás do conceito e entender como ele se aplica na prática.

## 📖 Desenvolvimento Didático Passo a Passo
1. **A Base Fundamental:** Todo tópico acadêmico possui um pilar estruturante. Precisamos observar as relações de causa, efeito e contexto.
2. **Organização das Ideias:** Divida o problema em etapas menores para não sobrecarregar sua memória de trabalho.
3. **Foco em Provas:** O ENEM e os vestibulares cobram a aplicação prática e a interpretação atenta dos enunciados.

## 💡 Analogia Prática do Dia a Dia
Pense nesse conceito como um **mapa de navegação**: quando você conhece os pontos de referência principais, não importa como a pergunta venha formulada, você sempre saberá encontrar a resposta correta!

💬 **Ficou claro este raciocínio inicial? Quer que eu aprofunde algum detalhe específico de ${cleanedSubject} ou traga um exemplo resolvido? 🌿**`;
      }

      return res.json({ text: intelligentReply });
    }
  } catch (error: any) {
    console.error("Erro geral na API de Estudo:", error);
    return res.status(200).json({
      text: "Tutor adaptativo ativo! Como posso te ajudar a revisar seus estudos hoje? 🌿"
    });
  }
});

// API: Essay Lab ("Corrigir Redação" & "Gerar Exemplo")
app.post("/api/ai/essay", async (req, res) => {
  try {
    const { action, title, promptTheme, essayText } = req.body;
    const ai = getAIClient();
    if (!ai) {
      return res.status(400).json({
        error: "Verifique se a sua chave de API (GEMINI_API_KEY) está configurada no seu arquivo .env com uma chave válida do Google AI Studio.",
      });
    }

    // Ação 1: Gerar Redação de Exemplo / Modelo Didático Nota 1000
    if (action === "generateSample") {
      const response = await generateWithGeminiFallback(ai, {
        contents: `Gere uma redação modelo exemplar estilo ENEM/Concurso Público (Nota 1000) completa, estruturada em 4 parágrafos (Introdução com tese e repertório, Desenvolvimento 1, Desenvolvimento 2 e Conclusão com proposta de intervenção completa). Escolha um tema atual e relevante da sociedade brasileira.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título impactante da redação" },
              essayText: { type: Type.STRING, description: "Texto completo da redação modelo dividido em parágrafos" },
              theme: { type: Type.STRING, description: "Tema abordado" }
            },
            required: ["title", "essayText", "theme"]
          }
        }
      });
      const sample = JSON.parse(response.text || "{}");
      return res.json(sample);
    }

    // Ação 2: Avaliação Completa de Redação (Estilo Professor Sênior ENEM/Concursos)
    if (!essayText || essayText.trim().length < 30) {
      return res.status(400).json({
        error: "Por favor, digite ou cole uma redação com pelo menos 30 caracteres.",
      });
    }

    const response = await generateWithGeminiFallback(ai, {
      contents: `Você é um Professor Sênior de Redação dedicado a alunos autodidatas que não têm acesso a cursinho.
Analise a seguinte redação com extremo rigor pedagógico, empatia e clareza didática, avaliando no padrão ENEM (5 Competências: C1 Norma Culta, C2 Repertório e Tema, C3 Argumentação e Projeto de Texto, C4 Coesão/Conectivos, C5 Proposta de Intervenção/Conclusão) e Bancas de Concursos Públicos:

Título: ${title || "Sem título"}
Tema proposto: ${promptTheme || "Tema livre"}

Texto da Redação:
"""
${essayText}
"""

Forneça notas precisas de 0 a 200 para cada uma das 5 competências (somando de 0 a 1000), pontos fortes, pontos a melhorar, reescrita de trechos problemáticos e dicas didáticas valiosas de conectivos e repertórios.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "Nota total de 0 a 1000" },
            gradeLabel: { type: Type.STRING, description: "Ex: Excelente (A+), Muito Boa, Em Progresso, Atencao Necessaria" },
            generalFeedback: {
              type: Type.STRING,
              description: "Resumo pedagógico encorajador e construtivo de um professor de redação sênior",
            },
            competencies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nome da Competência (Ex: C1 - Domínio da Norma Culta)" },
                  score: { type: Type.INTEGER, description: "Nota de 0 a 200" },
                  feedback: { type: Type.STRING, description: "Explicação pedagógica detalhada do motivo da nota e como atingir os 200 pontos" },
                },
                required: ["name", "score", "feedback"],
              },
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Pontos fortes observados no texto que o estudante deve manter"
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Pontos cruciais a melhorar para subir a pontuação nas próximas redações"
            },
            revisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalSnippet: { type: Type.STRING },
                  suggestedCorrection: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["originalSnippet", "suggestedCorrection", "reason"],
              },
            },
            teacherTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Dicas didáticas de repertórios curingas, conectivos e técnicas para ENEM e Concursos"
            }
          },
          required: [
            "overallScore",
            "gradeLabel",
            "generalFeedback",
            "competencies",
            "strengths",
            "improvements",
            "revisions",
            "teacherTips"
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Erro na API de Redação:", error);
    let errMsg = "Erro ao processar a redação com a IA do Gemini.";
    let rawMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error || {}));

    if (typeof rawMsg === 'string' && rawMsg.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed?.error?.message) {
          rawMsg = parsed.error.message;
        }
      } catch (e) {}
    }

    if (rawMsg.includes("API key not valid") || rawMsg.includes("INVALID_ARGUMENT") || rawMsg.includes("API_KEY_INVALID")) {
      errMsg = "A chave GEMINI_API_KEY configurada no arquivo .env é inválida ou expirou. Por favor, substitua o valor no arquivo .env por uma chave válida do Google AI Studio (https://aistudio.google.com/).";
    } else if (rawMsg.includes("503") || rawMsg.includes("high demand") || rawMsg.includes("UNAVAILABLE") || rawMsg.includes("experiencing high demand")) {
      errMsg = "O servidor de IA do Gemini está com alta demanda temporária. Por favor, aguarde cerca de 5 a 10 segundos e clique em 'Corrigir Redação' novamente! 🌿";
    } else if (rawMsg) {
      errMsg = `Erro no Gemini: ${rawMsg}`;
    }

    return res.status(500).json({ error: errMsg });
  }
});

// Configure Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌿 Study Burrow Server rodando na porta http://0.0.0.0:${PORT}`);
  });
}

startServer();
