import React from 'react';
import { TimerMode } from '../types';

interface PomodoroWidgetProps {
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetMode: (mode: TimerMode) => void;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  timeLeft,
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
  onSetMode,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const modeLabels: Record<TimerMode, string> = {
    work: 'FOCO ATUAL',
    shortBreak: 'PAUSA CURTA',
    longBreak: 'PAUSA LONGA',
  };

  return (
    <div className="bg-[#fdf9f0] border-4 border-[#7d5231] rounded-[2rem] p-6 shadow-[0_8px_0_0_rgba(125,82,49,1)] flex flex-col items-center relative overflow-hidden">
      {/* Timer Mode Selection */}
      <div className="flex gap-1.5 p-1 bg-[#e6e2d9] rounded-xl border border-[#c2c8be] mb-6 w-full max-w-xs text-xs font-bold font-body">
        <button
          onClick={() => onSetMode('work')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === 'work'
              ? 'bg-[#436444] text-white shadow-sm'
              : 'text-[#424841] hover:bg-[#dddad1]'
          }`}
        >
          Foco (25m)
        </button>
        <button
          onClick={() => onSetMode('shortBreak')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === 'shortBreak'
              ? 'bg-[#7d5231] text-white shadow-sm'
              : 'text-[#424841] hover:bg-[#dddad1]'
          }`}
        >
          Pausa (5m)
        </button>
        <button
          onClick={() => onSetMode('longBreak')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === 'longBreak'
              ? 'bg-[#99462a] text-white shadow-sm'
              : 'text-[#424841] hover:bg-[#dddad1]'
          }`}
        >
          Longa (15m)
        </button>
      </div>

      {/* Cozy Mascot Illustration */}
      <div className="relative group">
        <div className="w-56 h-56 overflow-visible mb-5 relative flex items-center justify-center">
          <img
            className="w-full h-full object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            alt="Mascote Coelhinho do Pomodoro"
            src="/coelho2.png"
          />
          {isRunning && (
            <div className="absolute top-2 right-2 bg-[#436444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse border border-white">
              • EM FOCO
            </div>
          )}
        </div>
      </div>

      {/* Timer Display */}
      <div className="font-headline text-[52px] md:text-[56px] leading-[60px] font-bold text-[#7d5231] tracking-widest mb-2 font-mono">
        {formatTime(timeLeft)}
      </div>

      <p className="font-body font-bold text-xs text-[#424841] mb-6 uppercase tracking-widest bg-[#f1eee5] px-3 py-1 rounded-full border border-[#c2c8be]">
        {modeLabels[mode]}
      </p>

      {/* Controls */}
      <div className="flex gap-3 w-full">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="chunky-btn btn-primary flex-1 rounded-xl cursor-pointer"
          >
            <span className="chunky-btn-inner bg-[#436444] hover:bg-[#385439] text-white font-body font-bold text-sm py-3.5 rounded-xl flex justify-center items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              INICIAR
            </span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="chunky-btn btn-tertiary flex-1 rounded-xl cursor-pointer"
          >
            <span className="chunky-btn-inner bg-[#99462a] hover:bg-[#853c23] text-white font-body font-bold text-sm py-3.5 rounded-xl flex justify-center items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-lg">pause</span>
              PAUSAR
            </span>
          </button>
        )}

        <button
          onClick={onReset}
          className="chunky-btn btn-tertiary rounded-xl cursor-pointer px-4"
          title="Reiniciar Cronômetro"
        >
          <span className="chunky-btn-inner bg-[#e6e2d9] hover:bg-[#dddad1] text-[#7d5231] border-2 border-[#7d5231] font-body font-bold text-sm py-3.5 rounded-xl flex justify-center items-center">
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </span>
        </button>
      </div>
    </div>
  );
};
