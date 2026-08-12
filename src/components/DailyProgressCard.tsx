import React from 'react';
import { UserStats } from '../types';

interface DailyProgressCardProps {
  stats: UserStats;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({ stats }) => {
  const percentage = Math.min(100, Math.max(0, (stats.xp / stats.maxXp) * 100));

  return (
    <section className="bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 md:p-8 shadow-[0_8px_0_0_rgba(125,82,49,1)] relative overflow-hidden">
      {/* Background cozy vine detail */}
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-[#436444]">local_florist</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 border-b-2 border-[#ffdcc5] border-dashed pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-2xl md:text-3xl font-bold text-[#99462a]">
              Jornada Diária
            </h3>
            <span className="bg-[#fe9572]/30 text-[#762c12] text-xs font-bold px-2.5 py-1 rounded-full border border-[#fe9572]">
              Nível {stats.level}
            </span>
          </div>
          <p className="font-body text-base text-[#424841] mt-1">
            Continue regando sua mente com sabedoria!
          </p>
        </div>

        {/* Streak badge */}
        <div className="flex items-center gap-2 text-[#436444] font-body font-bold text-sm bg-[#c6edc4] px-4 py-2 rounded-full border-2 border-[#436444] shadow-sm self-start sm:self-auto">
          <span className="material-symbols-outlined text-amber-600">local_fire_department</span>
          <span>{stats.streakDays} Dias Seguidos</span>
        </div>
      </div>

      {/* Duolingo Style Tactile 3D Progress Bar */}
      <div className="relative pt-2">
        <div className="w-full h-8 bg-[#e6e2d9] rounded-full border-2 border-[#c2c8be] overflow-hidden shadow-inner relative">
          <div
            className="h-full bg-[#436444] rounded-full relative transition-all duration-500"
            style={{
              width: `${percentage}%`,
              boxShadow: 'inset 0 -4px 0 0 rgba(0,0,0,0.18)',
            }}
          >
            {/* Glossy top reflection line */}
            <div className="absolute top-1 left-2 right-2 h-2 bg-white/30 rounded-full"></div>
          </div>
        </div>

        <div className="flex justify-between mt-3 font-body font-bold text-sm text-[#424841]">
          <span>0 XP</span>
          <span className="text-[#436444] font-bold">
            {stats.xp} XP / {stats.maxXp} XP
          </span>
        </div>
      </div>
    </section>
  );
};
