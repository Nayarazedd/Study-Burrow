import React, { useState, useEffect, useRef } from 'react';
import { TimerMode, Task } from '../types';

interface PomodoroViewProps {
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetMode: (mode: TimerMode) => void;
  onAddXp: (amount: number) => void;
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  timeLeft,
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
  onSetMode,
  onAddXp,
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Revisar anotações de Biologia Celular',
      completed: false,
      category: 'estudo',
      estimatedPomodoros: 2,
      completedPomodoros: 1,
    },
    {
      id: '2',
      title: 'Escrever rascunho de Redação sobre IA',
      completed: true,
      category: 'redacao',
      estimatedPomodoros: 1,
      completedPomodoros: 1,
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('estudo');
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'fireplace' | 'birds'>('none');

  // Web Audio API ambient noise generator refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ stop: () => void }[]>([]);

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) onAddXp(15);
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      category: newTaskCategory,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Web Audio Synth for Ambient Cozy Sounds
  const stopAmbientAudio = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
        // ignore
      }
    });
    activeNodesRef.current = [];
  };

  const playAmbientAudio = (type: 'rain' | 'fireplace' | 'birds') => {
    stopAmbientAudio();
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'rain') {
      // Pink noise / rain simulation
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      activeNodesRef.current.push(whiteNoise);
    } else if (type === 'fireplace') {
      // Warm crackling fire sound simulation
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.08;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      activeNodesRef.current.push(noise);
    } else if (type === 'birds') {
      // Soft melodic ambient chord generator
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.frequency.setValueAtTime(330, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      activeNodesRef.current.push(osc1, osc2);
    }
  };

  useEffect(() => {
    if (ambientSound === 'none') {
      stopAmbientAudio();
    } else {
      playAmbientAudio(ambientSound);
    }
    return () => {
      stopAmbientAudio();
    };
  }, [ambientSound]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#436444] mb-2">
          Estação Pomodoro
        </h2>
        <p className="font-body text-lg text-[#424841]">
          Mantenha o foco suave e faça pausas revigorantes com o ritmo do coelhinho.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big Timer & Controls */}
        <div className="lg:col-span-7 bg-[#fdf9f0] border-4 border-[#7d5231] rounded-[2rem] p-8 shadow-[0_8px_0_0_rgba(125,82,49,1)] flex flex-col items-center">
          {/* Mode Toggles */}
          <div className="flex gap-2 p-1.5 bg-[#e6e2d9] rounded-2xl border-2 border-[#c2c8be] mb-8 w-full font-body font-bold text-sm">
            <button
              onClick={() => onSetMode('work')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'work'
                  ? 'bg-[#436444] text-white shadow-md'
                  : 'text-[#424841] hover:bg-[#dddad1]'
              }`}
            >
              Foco (25 min)
            </button>
            <button
              onClick={() => onSetMode('shortBreak')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'shortBreak'
                  ? 'bg-[#7d5231] text-white shadow-md'
                  : 'text-[#424841] hover:bg-[#dddad1]'
              }`}
            >
              Pausa Curta (5 min)
            </button>
            <button
              onClick={() => onSetMode('longBreak')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'longBreak'
                  ? 'bg-[#99462a] text-white shadow-md'
                  : 'text-[#424841] hover:bg-[#dddad1]'
              }`}
            >
              Pausa Longa (15 min)
            </button>
          </div>

          {/* Big Digital Display */}
          <div className="font-headline text-[72px] sm:text-[92px] leading-none font-bold text-[#7d5231] tracking-widest my-4 font-mono select-none">
            {timeString}
          </div>

          {/* Ambient Sound Selector */}
          <div className="w-full my-6 p-4 bg-[#f1eee5] rounded-2xl border-2 border-[#e6e2d9]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-body font-bold text-sm text-[#7d5231] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">graphic_eq</span>
                Sons de Fundo Acolhedores:
              </span>
              {ambientSound !== 'none' && (
                <span className="text-xs text-[#436444] font-bold bg-[#c6edc4] px-2 py-0.5 rounded-full border border-[#436444]">
                  Tocando
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-body font-bold">
              <button
                onClick={() => setAmbientSound('none')}
                className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                  ambientSound === 'none'
                    ? 'bg-[#7d5231] text-white border-[#7d5231]'
                    : 'bg-white text-[#424841] border-[#c2c8be] hover:bg-[#ece8df]'
                }`}
              >
                Silêncio
              </button>
              <button
                onClick={() => setAmbientSound('rain')}
                className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  ambientSound === 'rain'
                    ? 'bg-[#436444] text-white border-[#436444]'
                    : 'bg-white text-[#424841] border-[#c2c8be] hover:bg-[#ece8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">rainy</span>
                Chuva
              </button>
              <button
                onClick={() => setAmbientSound('fireplace')}
                className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  ambientSound === 'fireplace'
                    ? 'bg-[#99462a] text-white border-[#99462a]'
                    : 'bg-white text-[#424841] border-[#c2c8be] hover:bg-[#ece8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                Lareira
              </button>
              <button
                onClick={() => setAmbientSound('birds')}
                className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  ambientSound === 'birds'
                    ? 'bg-[#5b7d5b] text-white border-[#5b7d5b]'
                    : 'bg-white text-[#424841] border-[#c2c8be] hover:bg-[#ece8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">nature</span>
                Passarinhos
              </button>
            </div>
          </div>

          {/* Action Chunky Buttons */}
          <div className="flex gap-4 w-full mt-2">
            {!isRunning ? (
              <button
                onClick={onStart}
                className="chunky-btn btn-primary flex-1 rounded-2xl cursor-pointer"
              >
                <span className="chunky-btn-inner bg-[#436444] hover:bg-[#385439] text-white font-body font-bold text-base py-4 rounded-2xl flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-2xl">play_arrow</span>
                  INICIAR SESSÃO
                </span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="chunky-btn btn-secondary flex-1 rounded-2xl cursor-pointer"
              >
                <span className="chunky-btn-inner bg-[#fe9572] text-[#762c12] font-body font-bold text-base py-4 rounded-2xl flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-2xl">pause</span>
                  PAUSAR TEMPO
                </span>
              </button>
            )}

            <button
              onClick={onReset}
              className="chunky-btn btn-tertiary rounded-2xl cursor-pointer px-5"
            >
              <span className="chunky-btn-inner bg-[#e6e2d9] hover:bg-[#dddad1] text-[#7d5231] border-2 border-[#7d5231] font-body font-bold text-base py-4 rounded-2xl flex justify-center items-center">
                <span className="material-symbols-outlined text-2xl">restart_alt</span>
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Task List for Session */}
        <div className="lg:col-span-5 bg-[#fdf9f0] border-2 border-[#7d5231] rounded-3xl p-6 shadow-[0_8px_0_0_rgba(125,82,49,1)]">
          <div className="flex items-center justify-between mb-4 border-b-2 border-[#ffdcc5] pb-3">
            <h3 className="font-headline text-xl font-bold text-[#7d5231] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#99462a]">task_alt</span>
              Metas da Sessão
            </h3>
            <span className="text-xs font-body font-bold text-[#436444] bg-[#c6edc4] px-2.5 py-1 rounded-full">
              +{tasks.filter((t) => t.completed).length * 15} XP ganhos
            </span>
          </div>

          {/* New Task Form */}
          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="O que vamos estudar agora?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-white border-2 border-[#c2c8be] rounded-xl px-3.5 py-2 text-sm font-body focus:outline-none focus:border-[#436444]"
            />
            <button
              type="submit"
              className="chunky-btn btn-primary rounded-xl px-4 cursor-pointer"
            >
              <span className="chunky-btn-inner bg-[#436444] text-white font-body font-bold text-sm py-2 px-3 rounded-xl flex items-center justify-center">
                +
              </span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-[#f1eee5] border-[#c2c8be] opacity-75'
                    : 'bg-white border-[#7d5231] shadow-sm'
                }`}
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-[#436444] border-[#436444] text-white'
                        : 'border-[#7d5231] bg-white'
                    }`}
                  >
                    {task.completed && (
                      <span className="material-symbols-outlined text-base">check</span>
                    )}
                  </div>
                  <span
                    className={`font-body text-sm font-semibold ${
                      task.completed ? 'line-through text-[#737970]' : 'text-[#1c1c17]'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-[#737970] hover:text-[#ba1a1a] p-1 rounded-lg transition-colors cursor-pointer"
                  title="Excluir tarefa"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-[#737970] font-body text-sm italic">
                Nenhuma meta criada ainda. Digite acima e clique em + para focar!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
