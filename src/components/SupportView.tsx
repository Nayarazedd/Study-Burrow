import React from 'react';

export const SupportView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 md:p-8 shadow-[0_8px_0_0_rgba(125,82,49,1)]">
        <div className="flex items-center gap-4 border-b-2 border-[#ffdcc5] pb-4 mb-6">
          <div className="w-14 h-14 bg-[#7d5231] text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm">
            💚
          </div>
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#7d5231]">
              Suporte e Acolhimento na Toca
            </h2>
            <p className="font-body text-[#424841] text-sm">
              Um ambiente projetado com carinho para reduzir o estresse de estudos.
            </p>
          </div>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-4">
          <div className="p-5 bg-[#f7f3ea] border-2 border-[#7d5231] rounded-2xl space-y-2">
            <h4 className="font-headline text-base font-bold text-[#436444] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">psychology</span>
              Como o Método Pomodoro ajuda na concentração?
            </h4>
            <p className="font-body text-sm text-[#1c1c17] leading-relaxed">
              O Pomodoro divide seu tempo em pequenos blocos de foco total (geralmente 25 minutos) seguidos por pausas curtas (5 minutos). Isso diminui a ansiedade de olhar para uma tarefa longa e treina seu cérebro a focar sabendo que a pausa virá logo em seguida.
            </p>
          </div>

          <div className="p-5 bg-[#f7f3ea] border-2 border-[#7d5231] rounded-2xl space-y-2">
            <h4 className="font-headline text-base font-bold text-[#99462a] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              Como funciona o assistente "Estudar com IA"?
            </h4>
            <p className="font-body text-sm text-[#1c1c17] leading-relaxed">
              O assistente utiliza o modelo avançado Gemini da Google para explicar matérias em tom amigável e acessível, criar quizes personalizados de fixação e tirar dúvidas instantâneas.
            </p>
          </div>

          <div className="p-5 bg-[#f7f3ea] border-2 border-[#7d5231] rounded-2xl space-y-2">
            <h4 className="font-headline text-base font-bold text-[#7d5231] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">edit_note</span>
              Como é feita a correção de redação?
            </h4>
            <p className="font-body text-sm text-[#1c1c17] leading-relaxed">
              A IA avalia sua redação com base nas 5 competências do ENEM/Vestibulares, gerando uma pontuação estimada de 0 a 1000, apontando pontos fortes, aspectos a melhorar e sugestões de reescrita frase a frase.
            </p>
          </div>

          <div className="p-5 bg-[#c6edc4]/40 border-2 border-[#436444] rounded-2xl space-y-2 text-center">
            <h4 className="font-headline text-base font-bold text-[#012108]">
              Precisa de ajuda ou tem sugestões?
            </h4>
            <p className="font-body text-xs text-[#2e4e30]">
              Estamos sempre aprimorando a Toca de Estudos para tornar sua jornada leve e prazerosa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
