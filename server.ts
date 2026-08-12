import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client lazily or safely
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Study Burrow" });
});

// API: AI Study Assistant ("Estudar com IA")
app.post("/api/ai/study", async (req, res) => {
  try {
    const { action, topic, question, history } = req.body;
    const ai = getAIClient();

    if (action === "explain") {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Você é o "Coelho Sábio" da Toca de Estudos (Study Burrow), um assistente de estudos acolhedor, gentil e muito didático no estilo cottagecore.
Explique o seguinte tema ou dúvida de forma clara, amigável, dividida em tópicos simples e fácil de entender:
Assunto/Dúvida: ${topic || question}`,
        config: {
          systemInstruction:
            "Responda sempre em Português do Brasil com um tom gentil, motivador e estruturado. Use formatação markdown limpa (títulos, bullet points e destaques em negrito).",
        },
      });
      return res.json({ text: response.text });
    }

    if (action === "quiz") {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Gere um quiz interativo de 3 perguntas de escolha múltipla sobre o tema: "${topic}".
Para cada pergunta, forneça 4 alternativas (A, B, C, D), indique o índice da resposta correta (0 para A, 1 para B, 2 para C, 3 para D) e uma breve explicação acolhedora de por que a resposta está certa.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: [
                    "id",
                    "questionText",
                    "options",
                    "correctAnswerIndex",
                    "explanation",
                  ],
                },
              },
            },
            required: ["topic", "questions"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    }

    if (action === "chat") {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Contexto do histórico de estudo: ${JSON.stringify(
          history || []
        )}.
Pergunta do estudante: "${question}"
Responda de forma acolhedora, encorajadora e explicativa em Português.`,
        config: {
          systemInstruction:
            "Você é o tutor inteligente da Toca de Estudos. Ajude o aluno a entender a matéria de forma leve e prática.",
        },
      });
      return res.json({ text: response.text });
    }

    return res.status(400).json({ error: "Ação não reconhecida" });
  } catch (error: any) {
    console.error("Erro na API de Estudo:", error);
    res.status(500).json({
      error:
        error.message ||
        "Ocorreu um erro ao consultar o assistente de IA da Toca.",
    });
  }
});

// API: Essay Lab ("Corrigir Redação")
app.post("/api/ai/essay", async (req, res) => {
  try {
    const { title, promptTheme, essayText } = req.body;

    if (!essayText || essayText.trim().length < 30) {
      return res.status(400).json({
        error: "Por favor, digite ou cole uma redação com pelo menos 30 caracteres.",
      });
    }

    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analise a seguinte redação no modelo padrão de avaliação estilo ENEM/Vestibulares (Nota de 0 a 1000):
Título: ${title || "Sem título"}
Tema proposto: ${promptTheme || "Tema livre"}

Texto da Redação:
"""
${essayText}
"""

Forneça uma avaliação detalhada, gentil e construtiva.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "Nota total de 0 a 1000" },
            gradeLabel: { type: Type.STRING, description: "Ex: Excelente (A+), Muito Boa, Em Progresso" },
            generalFeedback: {
              type: Type.STRING,
              description: "Resumo encorajador e construtivo sobre o texto",
            },
            competencies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.INTEGER, description: "Nota de 0 a 200" },
                  feedback: { type: Type.STRING },
                },
                required: ["name", "score", "feedback"],
              },
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
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
          },
          required: [
            "overallScore",
            "gradeLabel",
            "generalFeedback",
            "competencies",
            "strengths",
            "improvements",
            "revisions",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Erro na API de Redação:", error);
    res.status(500).json({
      error:
        error.message ||
        "Erro ao analisar a redação. Verifique se a sua chave de API está configurada.",
    });
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
