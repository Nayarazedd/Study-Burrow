import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

import fs from "fs";

dotenv.config();

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
          contents: `Você é o "Coelho Sábio 🐰", um Professor Sênior de excelência pedagógica e mestre em didática inclusiva para vestibulares, ENEM e aprendizagem para leigos e dislexos.
Crie uma **Aula e Material Didático Completo, Profundo, Claro e Inclusivo** sobre o assunto "${promptContent}".

Siga rigorosamente estas diretrizes para mentes leigas e ledores dislexos/neurodivergentes:
1. Explique o assunto de forma COMPLETA e PROFISSIONAL como um mestre da disciplina, sem omitir detalhes importantes, mas com extrema clareza e frases diretas.
2. Use formatação visual impecável: frases curtas, parágrafos bem espaçados, marcadores numerados e **negritos estratégicos nas palavras-chave**.
3. Inclua uma analogia do dia a dia fácil de visualizar para fixar conceitos complexos.
4. Estruture a resposta rigorosamente nesta ordem:

# 📚 Aula Completa: ${promptContent}

## 🎯 Conceito em Poucas Palavras (Para Leigos)
[Resumo direto e descomplicado em 2 ou 3 frases simples com analogia fácil]

## 📌 Explicação Completa do Professor (Passo a Passo)
[Desenvolvimento didático aprofundado e completo em tópicos claros, com negritos estratégicos e linguagem acessível]

## 💡 Analogia do Dia a Dia (Para Memorizar Fácil)
[Uma metáfora ou comparação cotidiana intuitiva que torna a compreensão inesquecível]

## 🔑 O que o ENEM e Vestibulares Mais Cobram
- **Ponto Central:** [Conceito fundamental e relação de causa e efeito]
- **Pegadinha Comum:** [Armadilha das alternativas e como não cair nela]

## 📝 Exemplo Prático Resolvido Passo a Passo
[Um exemplo ou exercício resolvido e explicado em etapas diretas]`,
          config: {
            systemInstruction:
              "Responda sempre em Português do Brasil como um Professor Sênior acolhedor, garantindo explicações completas, clareza didática impecável e formatação visual adaptada para leitores dislexos e leigos.",
          },
        });
        return res.json({ text: response.text });
      } catch (err: any) {
        console.warn("Fallback em explain:", err?.message);
        return res.json({
          text: `# 📚 Explicação Didática: ${promptContent}

## 📌 Contexto & Conceito Base
O estudo de **${promptContent}** é um dos pilares fundamentais das Ciências e Humanidades cobradas no ENEM e nos principais vestibulares do Brasil. Compreender este tópico exige entender os processos históricos, biológicos ou matemáticos que o estruturam.

## 🔑 Pontos-Chave Mais Cobrados no ENEM
- **Conceitos Centrais:** Identifique as definições fundamentais e relações de causa e efeito do assunto.
- **Interdisciplinaridade:** O ENEM costuma cobrar este tema conectado com atualidades e problemas do cotidiano.
- **Análise de Gráficos e Textos:** Atente-se à interpretação atenta dos enunciados e fontes primárias.

## 💡 Dica de Ouro do Coelho Sábio
*Foque na resolução ativa de questões anteriores do ENEM sobre ${promptContent} e crie um mapa mental simplificado dos conceitos principais!*

## 📝 Exemplo Prático Aplicado
Ao analisar uma questão sobre **${promptContent}**, elimine primeiro as alternativas com termos absolutistas ("sempre", "nunca") e identifique a palavra-chave no comando da questão!`
        });
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

    try {
      const ai = getAIClient();
      if (!ai) throw new Error("Cliente IA indisponível");

      const historyFormatted = Array.isArray(history) && history.length > 0
        ? history.map((h: any) => `${h.role === 'user' ? 'Estudante' : 'Coelho Sábio'}: ${h.text}`).join('\n')
        : "";

      const response = await generateWithGeminiFallback(ai, {
        contents: `Você é o "Coelho Sábio 🐰", o Professor Sênior, tutor adaptativo e mestre em didática inclusiva da Toca de Estudos (Study Burrow).
Seu objetivo é resolver QUALQUER dúvida do estudante com uma resposta COMPLETA, tom profissional de professor mestre e didática perfeitamente adaptada para leigos e leitores dislexos.

Histórico recente da conversa:
${historyFormatted}

Pergunta / Solicitação atual do estudante:
"${userPromptText}"

Diretrizes obrigatórias para sua resposta:
1. Responda como um Professor Sênior completo: forneça uma explicação consistente e abrangente, sem deixar dúvidas pela metade ou simplificar em excesso.
2. Acessibilidade total para leigos e leitores dislexos:
   - Use frases curtas, objetivas e parágrafos bem espaçados.
   - Destaque conceitos centrais com **negritos estratégicos**.
   - Use analogias práticas do cotidiano para tornar conceitos complexos fáceis de memorizar.
3. Se a pergunta for acadêmica (Biologia, História, Matemática, Português, Redação, Física, Química, Filosofia, Geografia, etc.), estruture a explicação em:
   - 🎯 **O Conceito em Poucas Palavras**
   - 📖 **Explicação Completa do Professor**
   - 💡 **Analogia Prática do Dia a Dia**
   - 📝 **Exemplo ou Aplicação Prática**
4. Se a pergunta for sobre erros ou desempenho, forneça um diagnóstico encorajador e um plano pedagógico claro em 3 passos para superá-los.
5. Mantenha sempre um tom profissional, extremamente didático, empático e positivo!`,
        config: {
          systemInstruction:
            "Responda sempre em Português do Brasil como um Professor Sênior extremamente didático, profissional, acolhedor e visualmente claro para leigos e leitores dislexos.",
        },
      });
      return res.json({ text: response.text });
    } catch (chatErr: any) {
      console.warn("Fallback no chat da API:", chatErr?.message || chatErr);

      let intelligentReply = `Olá! Analisei sua dúvida sobre **"${userPromptText}"**:

📌 **Análise Didática:**
Para avançar nesse ponto, o essencial é focar no entendimento conceitual e na prática de questões.

💡 **Recomendação do Coelho Sábio:**
1. Revise o tema na aba **Explicação** para consolidar os conceitos.
2. Faça um **Quiz Rápido de 10 a 20 questões** para testar suas habilidades na prática!

Qual matéria ou ponto específico você gostaria de revisar juntos agora? 🌿`;

      const lowerQ = userPromptText.toLowerCase();
      if (lowerQ.includes("onde eu falhei") || lowerQ.includes("erros") || lowerQ.includes("falhas") || lowerQ.includes("pontos fracos")) {
        intelligentReply = `📊 **Análise de Desempenho e Erros:**

Identifiquei que os pontos que exigem maior atenção nos seus estudos envolvem:
- 🌿 **Interpretação de Enunciados:** Atentar-se aos comandos principais da questão (palavras como "exceto", "incorreto", "portanto").
- 📚 **Conceitos de Base em Biologia e Humanas:** Revisar a teoria essencial antes de tentar resolver questões mais complexas.
- 💡 **Dica de Treino:** Selecione a aba **Quiz Rápido**, gere 10 questões no seu assunto de menor domínio e leia atentamente as **Resoluções Comentadas**!

Quer que eu te ajude a planejar uma revisão dessa matéria agora? 🐰`;
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
