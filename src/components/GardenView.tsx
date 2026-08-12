import React, { useState } from 'react';
import { UserStats, GardenPlant, Badge } from '../types';

interface GardenViewProps {
  stats: UserStats;
  onAddXp: (amount: number) => void;
}

export const GardenView: React.FC<GardenViewProps> = ({ stats, onAddXp }) => {
  const [plants, setPlants] = useState<GardenPlant[]>([
    { id: '1', name: 'Margarida do Foco', type: 'daisy', growthStage: 3, plantedAt: 'Hoje', wateredTimes: 3 },
    { id: '2', name: 'Girassol do Conhecimento', type: 'sunflower', growthStage: 2, plantedAt: 'Ontem', wateredTimes: 2 },
    { id: '3', name: 'Trevo de 4 Folhas', type: 'clover', growthStage: 4, plantedAt: '3 dias atrás', wateredTimes: 5 },
    { id: '4', name: 'Lavanda Relaxante', type: 'lavender', growthStage: 1, plantedAt: 'Hoje', wateredTimes: 1 },
  ]);

  const badges: Badge[] = [
    {
      id: '1',
      title: 'Primeiro Foco',
      description: 'Concluiu sua 1ª sessão Pomodoro com sucesso.',
      icon: 'timer',
      unlocked: stats.completedPomodoros >= 1,
      progress: Math.min(100, (stats.completedPomodoros / 1) * 100),
    },
    {
      id: '2',
      title: 'Hábito de Ouro',
      description: 'Manteve 3 dias seguidos de estudo na Toca.',
      icon: 'local_fire_department',
      unlocked: stats.streakDays >= 3,
      progress: Math.min(100, (stats.streakDays / 3) * 100),
    },
    {
      id: '3',
      title: 'Mestre da Redação',
      description: 'Submeteu e corrigiu uma redação com a IA.',
      icon: 'edit_note',
      unlocked: stats.essaysGraded >= 1,
      progress: Math.min(100, (stats.essaysGraded / 1) * 100),
    },
    {
      id: '4',
      title: 'Jardineiro de Toca',
      description: 'Acumulou 100 XP regando sua mente.',
      icon: 'local_florist',
      unlocked: stats.xp >= 100,
      progress: Math.min(100, (stats.xp / 100) * 100),
    },
  ];

  const plantEmojis: Record<GardenPlant['type'], Record<number, string>> = {
    daisy: { 1: '🌱', 2: '🌿', 3: '🌼', 4: '🌸' },
    sunflower: { 1: '🌱', 2: '🌿', 3: '🌻', 4: '🌻✨' },
    clover: { 1: '🌱', 2: '☘️', 3: '🍀', 4: '🍀✨' },
    lavender: { 1: '🌱', 2: '🌿', 3: '🪻', 4: '🪻✨' },
    moss: { 1: '🌱', 2: '🪴', 3: '🌿', 4: '🌳' },
  };

  const waterPlant = (id: string) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStage = p.growthStage < 4 ? ((p.growthStage + 1) as 1 | 2 | 3 | 4) : 4;
          return { ...p, growthStage: nextStage, wateredTimes: p.wateredTimes + 1 };
        }
        return p;
      })
    );
    onAddXp(5);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-[#fe9572]/20 border-2 border-[#fe9572] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-[0_6px_0_0_#fe9572]">
        <div className="w-20 h-20 bg-[#fe9572] rounded-2xl flex items-center justify-center text-[#762c12] shrink-0 shadow-[0_4px_0_0_#762c12]">
          <span className="material-symbols-outlined text-4xl">local_florist</span>
        </div>
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#762c12] mb-1">
            Jardim de Estudos e Conquistas
          </h2>
          <p className="font-body text-[#390b00] text-base">
            Cada minuto de foco rega suas sementes do conhecimento. Acompanhe a evolução do seu jardim e desbloqueie insígnias acolhedoras.
          </p>
        </div>
      </div>

      {/* Garden Section */}
      <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 md:p-8 shadow-[0_8px_0_0_rgba(125,82,49,1)] space-y-6">
        <div className="flex justify-between items-center border-b-2 border-[#ffdcc5] pb-3">
          <h3 className="font-headline text-xl font-bold text-[#7d5231] flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#436444]">yard</span>
            Seu Jardim Atual
          </h3>
          <span className="text-xs font-body font-bold text-[#436444] bg-[#c6edc4] px-3 py-1 rounded-full border border-[#436444]">
            {plants.filter((p) => p.growthStage === 4).length} de {plants.length} Flores Florescidas
          </span>
        </div>

        {/* Garden Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {plants.map((plant) => {
            const emoji = plantEmojis[plant.type][plant.growthStage];
            const isFullyGrown = plant.growthStage === 4;

            return (
              <div
                key={plant.id}
                className="p-5 bg-[#f7f3ea] border-2 border-[#7d5231] rounded-2xl flex flex-col items-center text-center relative shadow-sm group hover:-translate-y-1 transition-transform"
              >
                <div className="text-5xl my-3 animate-bounce cursor-default">
                  {emoji}
                </div>
                <h4 className="font-headline text-sm font-bold text-[#1c1c17] mb-1">
                  {plant.name}
                </h4>
                <p className="font-body text-xs text-[#737970] mb-3">
                  Estágio {plant.growthStage} / 4
                </p>

                <button
                  onClick={() => waterPlant(plant.id)}
                  disabled={isFullyGrown}
                  className={`w-full py-2 px-3 rounded-xl font-body font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    isFullyGrown
                      ? 'bg-[#c6edc4] text-[#012108] border border-[#436444]'
                      : 'bg-[#436444] hover:bg-[#385439] text-white shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">water_drop</span>
                  {isFullyGrown ? 'Florescida!' : 'Regar (+5 XP)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 md:p-8 shadow-[0_8px_0_0_rgba(125,82,49,1)] space-y-6">
        <div className="border-b-2 border-[#ffdcc5] pb-3">
          <h3 className="font-headline text-xl font-bold text-[#7d5231] flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#99462a]">
              workspace_premium
            </span>
            Insígnias e Conquistas
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                b.unlocked
                  ? 'bg-[#c6edc4]/30 border-[#436444] text-[#012108]'
                  : 'bg-[#f1eee5] border-[#c2c8be] text-[#737970]'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                  b.unlocked
                    ? 'bg-[#436444] text-white border-[#2e4e30] shadow-sm'
                    : 'bg-[#e6e2d9] text-[#737970] border-[#c2c8be]'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">{b.icon}</span>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-headline text-sm font-bold">{b.title}</h4>
                  {b.unlocked ? (
                    <span className="text-[10px] font-body font-bold bg-[#436444] text-white px-2 py-0.5 rounded-full">
                      Desbloqueado!
                    </span>
                  ) : (
                    <span className="text-[10px] font-body text-[#737970]">
                      {Math.round(b.progress)}%
                    </span>
                  )}
                </div>
                <p className="font-body text-xs leading-tight">{b.description}</p>
                {!b.unlocked && (
                  <div className="w-full h-1.5 bg-[#e6e2d9] rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-[#99462a] rounded-full"
                      style={{ width: `${b.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
