import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface AiStudyViewProps {
  onAddXp: (amount: number) => void;
}

export const AiStudyView: React.FC<AiStudyViewProps> = ({ onAddXp }) => {
  const [activeSubTab, setActiveSubTab] = useState<'explain' | 'quiz' | 'chat'>('explain');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Explain mode state
  const [explanationResult, setExplanationResult] = useState('');

  // Quiz mode state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Chat mode state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([
    {
      sender: 'ai',
      text: 'Olá! Sou o Coelho Sábio da Toca de Estudos. Qual matéria ou dúvida você gostaria de revisar juntos hoje? 🌿',
    },
  ]);

  const quickTopics = [
    'Biologia: Fotossíntese',
    'História: Era Vargas',
    'Matemática: Funções do 2º Grau',
    'Português: Regras de Crase',
    'Física: Leis de Newton',
    'Filosofia: Sócrates e Platão',
  ];

  // Request Explanation from AI
  const handleRequestExplanation = async (selectedTopic?: string) => {
    const topicToUse = selectedTopic || topic;
    if (!topicToUse.trim()) return;

    setLoading(true);
    setError('');
    setExplanationResult('');

    try {
      const res = await fetch('/api/ai/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'explain', topic: topicToUse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao consultar IA');

      setExplanationResult(data.text);
      onAddXp(10);
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com a IA.');
    } finally {
      setLoading(false);
    }
  };

  // Generate Quiz from AI
  const handleGenerateQuiz = async (selectedTopic?: string) => {
    const topicToUse = selectedTopic || topic;
    if (!topicToUse.trim()) return;

    setLoading(true);
    setError('');
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizCompleted(false);

    try {
      const res = await fetch('/api/ai/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quiz', topic: topicToUse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar quiz');

      if (data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
      } else {
        throw new Error('Formato de quiz inválido retornado.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer in Quiz
  const handleSelectQuizAnswer = (questionIndex: number, optionIndex: number) => {
    if (userAnswers[questionIndex] !== undefined) return; // prevent re-answering
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleFinishQuiz = () => {
    setQuizCompleted(true);
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    onAddXp(correctCount * 10 + 10);
  };

  // Chat message send
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          question: userText,
          history: chatMessages.slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no chat');

      setChatMessages((prev) => [...prev, { sender: 'ai', text: data.text }]);
      onAddXp(5);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Ops! Tive um probleminha para responder agora. Tente novamente em instantes.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-[#fe9572]/20 border-2 border-[#fe9572] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-[0_6px_0_0_#fe9572]">
        <div className="w-20 h-20 bg-[#99462a] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-[0_4px_0_0_#762c12]">
          <span className="material-symbols-outlined text-4xl">auto_awesome</span>
        </div>
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#762c12] mb-1">
            Estudar com IA na Toca
          </h2>
          <p className="font-body text-[#390b00] text-base">
            Sessões guiadas e amigáveis para revisar matérias difíceis, entender conceitos passo a passo e testar seus conhecimentos sem estresse.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 p-2 bg-[#f1eee5] rounded-2xl border-2 border-[#e6e2d9] font-body font-bold text-sm max-w-md mx-auto">
        <button
          onClick={() => setActiveSubTab('explain')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'explain'
              ? 'bg-[#99462a] text-white shadow-md'
              : 'text-[#424841] hover:bg-[#ece8df]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">menu_book</span>
          Explicação
        </button>

        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'quiz'
              ? 'bg-[#436444] text-white shadow-md'
              : 'text-[#424841] hover:bg-[#ece8df]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">quiz</span>
          Quiz Rápido
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'chat'
              ? 'bg-[#7d5231] text-white shadow-md'
              : 'text-[#424841] hover:bg-[#ece8df]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">forum</span>
          Tira-Dúvidas
        </button>
      </div>

      {/* Quick Suggestions Chips */}
      {activeSubTab !== 'chat' && (
        <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-2xl p-4 shadow-sm">
          <p className="font-body font-bold text-xs text-[#7d5231] uppercase tracking-wider mb-2.5">
            Sugestões Rápidas de Estudo:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickTopics.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTopic(t);
                  if (activeSubTab === 'explain') handleRequestExplanation(t);
                  if (activeSubTab === 'quiz') handleGenerateQuiz(t);
                }}
                className="bg-[#f1eee5] hover:bg-[#c6edc4] hover:text-[#012108] text-[#424841] text-xs font-body font-bold px-3 py-1.5 rounded-xl border border-[#c2c8be] transition-colors cursor-pointer"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      {activeSubTab === 'explain' && (
        <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 md:p-8 shadow-[0_8px_0_0_rgba(125,82,49,1)] space-y-6">
          <div className="space-y-2">
            <label className="font-headline text-lg font-bold text-[#7d5231]">
              Qual matéria ou assunto você quer que o Coelho Sábio explique?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Leis de Newton, Fotossíntese, Teorema de Pitágoras..."
                className="flex-1 bg-white border-2 border-[#c2c8be] rounded-xl px-4 py-3 font-body focus:outline-none focus:border-[#436444]"
              />
              <button
                onClick={() => handleRequestExplanation()}
                disabled={loading || !topic.trim()}
                className="chunky-btn btn-secondary rounded-xl cursor-pointer disabled:opacity-50"
              >
                <span className="chunky-btn-inner bg-[#fe9572] text-[#762c12] font-body font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                  {loading ? 'Pensando...' : 'Explicar'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[#ffdad6] text-[#93000a] border-2 border-[#ba1a1a] rounded-2xl font-body text-sm">
              {error}
            </div>
          )}

          {explanationResult && (
            <div className="p-6 bg-[#f7f3ea] border-2 border-[#7d5231] rounded-2xl space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#e6e2d9] pb-3">
                <span className="material-symbols-outlined text-2xl text-[#436444]">
                  auto_awesome
                </span>
                <h4 className="font-headline text-xl font-bold text-[#436444]">
                  Explicação do Coelho Sábio
                </h4>
              </div>

              <div className="prose max-w-none font-body text-[#1c1c17] text-base whitespace-pre-wrap leading-relaxed">
                {explanationResult}
              </div>

              <div className="mt-4 p-3 bg-[#c6edc4] border border-[#436444] rounded-xl text-xs font-body font-bold text-[#012108] flex items-center gap-2">
                <span className="material-symbols-outlined text-base">grade</span>
                Você ganhou +10 XP por revisar este conteúdo!
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'quiz' && (
        <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 md:p-8 shadow-[0_8px_0_0_rgba(125,82,49,1)] space-y-6">
          <div className="space-y-2">
            <label className="font-headline text-lg font-bold text-[#7d5231]">
              Gere um Quiz Personalizado para testar seus conhecimentos:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: História do Brasil, Tabela Periódica, Orações Subordinadas..."
                className="flex-1 bg-white border-2 border-[#c2c8be] rounded-xl px-4 py-3 font-body focus:outline-none focus:border-[#436444]"
              />
              <button
                onClick={() => handleGenerateQuiz()}
                disabled={loading || !topic.trim()}
                className="chunky-btn btn-primary rounded-xl cursor-pointer disabled:opacity-50"
              >
                <span className="chunky-btn-inner bg-[#436444] text-white font-body font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                  {loading ? 'Criando Quiz...' : 'Gerar Quiz'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[#ffdad6] text-[#93000a] border-2 border-[#ba1a1a] rounded-2xl font-body text-sm">
              {error}
            </div>
          )}

          {quizQuestions.length > 0 && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#ffdcc5] pb-3 flex justify-between items-center">
                <h4 className="font-headline text-xl font-bold text-[#99462a]">
                  Quiz: {topic}
                </h4>
                <span className="text-xs font-body font-bold text-[#7d5231]">
                  {Object.keys(userAnswers).length} de {quizQuestions.length} respondidas
                </span>
              </div>

              {quizQuestions.map((q, qIdx) => {
                const selectedOpt = userAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div
                    key={q.id || qIdx}
                    className="p-5 bg-[#f7f3ea] border-2 border-[#7d5231] rounded-2xl space-y-3"
                  >
                    <p className="font-body font-bold text-base text-[#1c1c17]">
                      {qIdx + 1}. {q.questionText}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-white border-[#c2c8be] text-[#1c1c17] hover:bg-[#ece8df]';

                        if (isAnswered) {
                          if (optIdx === q.correctAnswerIndex) {
                            btnStyle = 'bg-[#c6edc4] border-[#436444] text-[#012108] font-bold';
                          } else if (selectedOpt === optIdx) {
                            btnStyle = 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a] font-bold';
                          } else {
                            btnStyle = 'bg-white/50 border-[#c2c8be] text-[#737970] opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border-2 font-body text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && optIdx === q.correctAnswerIndex && (
                              <span className="material-symbols-outlined text-lg text-[#436444]">
                                check_circle
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="p-3 bg-[#f1eee5] border-l-4 border-[#7d5231] rounded-r-xl text-xs font-body text-[#424841] mt-2">
                        <strong className="text-[#7d5231]">Explicação:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!quizCompleted && Object.keys(userAnswers).length === quizQuestions.length && (
                <button
                  onClick={handleFinishQuiz}
                  className="chunky-btn btn-primary w-full rounded-2xl cursor-pointer"
                >
                  <span className="chunky-btn-inner bg-[#436444] text-white font-body font-bold py-3.5 rounded-2xl flex justify-center items-center gap-2">
                    Concluir Quiz e Coletar Recompensa XP ✨
                  </span>
                </button>
              )}

              {quizCompleted && (
                <div className="p-6 bg-[#c6edc4] border-2 border-[#436444] rounded-2xl text-center space-y-2">
                  <h4 className="font-headline text-2xl font-bold text-[#012108]">
                    Parabéns pelo Estudo! 🌟
                  </h4>
                  <p className="font-body text-[#2e4e30]">
                    Você concluiu o quiz de {topic} e acumulou XP para a sua Jornada Diária!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'chat' && (
        <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 shadow-[0_8px_0_0_rgba(125,82,49,1)] flex flex-col h-[500px]">
          <div className="flex items-center gap-3 border-b-2 border-[#ffdcc5] pb-3 mb-4">
            <span className="material-symbols-outlined text-2xl text-[#99462a]">forum</span>
            <h4 className="font-headline text-xl font-bold text-[#7d5231]">
              Conversa com o Coelho Sábio
            </h4>
          </div>

          {/* Messages scroll */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-[#7d5231] text-white flex items-center justify-center shrink-0 font-bold text-xs border border-white shadow-sm">
                    🐰
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl font-body text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#5b7d5b] text-white rounded-br-none shadow-sm'
                      : 'bg-[#f1eee5] text-[#1c1c17] border border-[#c2c8be] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2 border-t border-[#e6e2d9]">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pergunte qualquer dúvida de estudo..."
              className="flex-1 bg-white border-2 border-[#c2c8be] rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#436444]"
            />
            <button
              type="submit"
              disabled={loading || !chatInput.trim()}
              className="chunky-btn btn-primary rounded-xl cursor-pointer disabled:opacity-50"
            >
              <span className="chunky-btn-inner bg-[#436444] text-white font-body font-bold px-4 py-2.5 rounded-xl flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">send</span>
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
