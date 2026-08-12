import React, { useState } from 'react';
import { EssayCorrectionResult } from '../types';

interface EssayLabViewProps {
  onAddXp: (amount: number) => void;
}

export const EssayLabView: React.FC<EssayLabViewProps> = ({ onAddXp }) => {
  const [essayTitle, setEssayTitle] = useState('');
  const [essayTheme, setEssayTheme] = useState('');
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EssayCorrectionResult | null>(null);

  const sampleThemes = [
    'Os Desafios do Uso da Inteligência Artificial no Mercado de Trabalho',
    'Caminhos para Combater a Insegurança Alimentar no Brasil',
    'A Importância da Preservação da Saúde Mental na Juventude Contemporânea',
    'Impactos das Mudanças Climáticas e Desenvolvimento Sustentável',
  ];

  const sampleEssayText = `O advento da inteligência artificial transformou radicalmente as relações sociais e profissionais na contemporaneidade. Nesse contexto, torna-se imperativo analisar como essa tecnologia impacta o mercado de trabalho, gerando tanto oportunidades de inovação quanto desafios de qualificação.

Em primeira análise, cabe ressaltar que a automação de tarefas repetitivas permite que os trabalhadores foquem em atividades mais criativas e estratégicas. Contudo, a rápida substituição de postos de trabalho exige uma formação continuada que nem todos os cidadãos possuem acesso, evidenciando a necessidade de políticas públicas inclusivas.

Além disso, a falta de regulamentação ética adequada sobre o uso de dados e algoritmos pode intensificar disparidades socioeconômicas. Como defende o sociólogo Zygmunt Bauman, as transformações da modernidade requerem adaptação constante para que a sociedade não se fragilize.

Portanto, medidas são necessárias para mitigar esses impactos. O Ministério da Educação, em parceria com o Ministério do Trabalho, deve implementar programas de capacitação tecnológica gratuita e cursos de requalificação profissional. Dessa forma, o país poderá avançar rumo a um futuro mais justo e integrado.`;

  const handleAnalyzeEssay = async () => {
    if (!essayText.trim() || essayText.trim().length < 30) {
      setError('Por favor, escreva ou cole um texto de redação com pelo menos 30 caracteres.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: essayTitle || 'Sem Título',
          promptTheme: essayTheme || 'Tema Livre',
          essayText: essayText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar redação');

      setResult(data);
      onAddXp(30);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao conectar com o laboratório de redação.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setEssayTitle('A Era Algorítmica e o Trabalho');
    setEssayTheme(sampleThemes[0]);
    setEssayText(sampleEssayText);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#c6edc4]/30 border-2 border-[#436444] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-[0_6px_0_0_#436444]">
        <div className="w-20 h-20 bg-[#436444] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-[0_4px_0_0_#2e4e30]">
          <span className="material-symbols-outlined text-4xl">edit_note</span>
        </div>
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#012108] mb-1">
            Laboratório de Redação
          </h2>
          <p className="font-body text-[#2e4e30] text-base">
            Feedback construtivo, gentil e detalhado para aperfeiçoar sua escrita no modelo ENEM / Vestibulares.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Essay Input Column */}
        <div className="lg:col-span-7 space-y-5 bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 shadow-[0_8px_0_0_rgba(125,82,49,1)]">
          <div className="flex justify-between items-center border-b-2 border-[#ffdcc5] pb-3">
            <h3 className="font-headline text-xl font-bold text-[#7d5231]">
              Sua Redação
            </h3>
            <button
              onClick={loadSample}
              className="text-xs font-body font-bold text-[#99462a] hover:underline cursor-pointer"
            >
              Exemplo de Redação 📝
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-body font-bold text-xs text-[#7d5231] uppercase mb-1">
                Título da Redação (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: A Era Algorítmica e o Trabalho"
                value={essayTitle}
                onChange={(e) => setEssayTitle(e.target.value)}
                className="w-full bg-white border-2 border-[#c2c8be] rounded-xl p-3 font-body text-sm focus:outline-none focus:border-[#436444]"
              />
            </div>

            <div>
              <label className="block font-body font-bold text-xs text-[#7d5231] uppercase mb-1">
                Tema / Proposta de Redação:
              </label>
              <input
                type="text"
                placeholder="Ex: Os desafios da inteligência artificial no trabalho"
                value={essayTheme}
                onChange={(e) => setEssayTheme(e.target.value)}
                className="w-full bg-white border-2 border-[#c2c8be] rounded-xl p-3 font-body text-sm focus:outline-none focus:border-[#436444] mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {sampleThemes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setEssayTheme(t)}
                    className="text-[11px] font-body bg-[#f1eee5] hover:bg-[#c6edc4] text-[#424841] px-2.5 py-1 rounded-lg border border-[#c2c8be] cursor-pointer"
                  >
                    + {t.slice(0, 35)}...
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-body font-bold text-xs text-[#7d5231] uppercase">
                  Texto da Redação:
                </label>
                <span className="text-xs font-body text-[#737970]">
                  {essayText.length} caracteres ({essayText.split(/\s+/).filter(Boolean).length} palavras)
                </span>
              </div>
              <textarea
                rows={12}
                placeholder="Cole ou digite seu texto aqui..."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                className="w-full bg-white border-2 border-[#c2c8be] rounded-xl p-4 font-body text-sm focus:outline-none focus:border-[#436444] leading-relaxed resize-y"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-[#ffdad6] text-[#93000a] border-2 border-[#ba1a1a] rounded-xl font-body text-xs font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyzeEssay}
            disabled={loading || !essayText.trim()}
            className="chunky-btn btn-primary w-full rounded-2xl cursor-pointer disabled:opacity-50"
          >
            <span className="chunky-btn-inner bg-[#436444] hover:bg-[#385439] text-white font-body font-bold text-base py-4 rounded-2xl flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
              {loading ? 'Analisando Redação com IA...' : 'Corrigir Redação (+30 XP)'}
            </span>
          </button>
        </div>

        {/* Correction Results Column */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 shadow-[0_8px_0_0_rgba(125,82,49,1)] space-y-6">
              {/* Score Header */}
              <div className="text-center p-6 bg-[#f1eee5] border-2 border-[#7d5231] rounded-2xl">
                <span className="text-xs font-body font-bold text-[#7d5231] uppercase tracking-wider">
                  Nota Estimada
                </span>
                <div className="font-headline text-5xl font-bold text-[#436444] my-2">
                  {result.overallScore} <span className="text-xl text-[#7d5231]">/ 1000</span>
                </div>
                <div className="inline-block bg-[#fe9572] text-[#762c12] font-body font-bold text-xs px-3.5 py-1 rounded-full border border-[#762c12]">
                  {result.gradeLabel}
                </div>
                <p className="font-body text-xs text-[#424841] mt-3 italic">
                  "{result.generalFeedback}"
                </p>
              </div>

              {/* Competencies */}
              <div className="space-y-3">
                <h4 className="font-headline text-lg font-bold text-[#7d5231]">
                  Competências ENEM
                </h4>
                {result.competencies?.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-white border border-[#c2c8be] rounded-xl space-y-1">
                    <div className="flex justify-between items-center font-body text-xs font-bold text-[#1c1c17]">
                      <span>{comp.name}</span>
                      <span className="text-[#436444]">{comp.score} / 200</span>
                    </div>
                    <div className="w-full h-2 bg-[#e6e2d9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#436444] rounded-full"
                        style={{ width: `${(comp.score / 200) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-body text-[#424841]">{comp.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="space-y-3">
                {result.strengths && result.strengths.length > 0 && (
                  <div className="p-4 bg-[#c6edc4]/40 border-2 border-[#436444] rounded-2xl">
                    <h5 className="font-headline text-sm font-bold text-[#012108] mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#436444]">
                        thumb_up
                      </span>
                      Pontos Fortes:
                    </h5>
                    <ul className="list-disc list-inside text-xs font-body text-[#012108] space-y-1">
                      {result.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.improvements && result.improvements.length > 0 && (
                  <div className="p-4 bg-[#ffdcc5]/40 border-2 border-[#99462a] rounded-2xl">
                    <h5 className="font-headline text-sm font-bold text-[#7a2f15] mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#99462a]">
                        tips_and_updates
                      </span>
                      Pontos a Melhorar:
                    </h5>
                    <ul className="list-disc list-inside text-xs font-body text-[#390b00] space-y-1">
                      {result.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Specific Sentence Revisions */}
              {result.revisions && result.revisions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-headline text-base font-bold text-[#7d5231]">
                    Sugestões de Reescreve:
                  </h4>
                  {result.revisions.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#f1eee5] border-l-4 border-[#99462a] rounded-r-xl text-xs font-body space-y-1"
                    >
                      <p className="text-[#ba1a1a] line-through">
                        "{rev.originalSnippet}"
                      </p>
                      <p className="text-[#436444] font-bold">
                        👉 Sugestão: "{rev.suggestedCorrection}"
                      </p>
                      <p className="text-[#737970] italic text-[11px]">
                        Motivo: {rev.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#fdf9f0] border-2 border-dashed border-[#7d5231] rounded-3xl p-8 text-center text-[#737970] font-body space-y-3">
              <span className="material-symbols-outlined text-5xl text-[#996a47]">
                rule_folder
              </span>
              <h4 className="font-headline text-lg font-bold text-[#7d5231]">
                Nenhuma correção ativa
              </h4>
              <p className="text-sm">
                Escreva ou cole seu texto ao lado e clique em "Corrigir Redação" para receber uma análise completa e atenciosa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
