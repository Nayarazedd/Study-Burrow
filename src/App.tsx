/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, UserStats, TimerMode } from './types';
import { SidebarNav } from './components/SidebarNav';
import { BottomNav } from './components/BottomNav';
import { DailyProgressCard } from './components/DailyProgressCard';
import { PomodoroWidget } from './components/PomodoroWidget';
import { PomodoroView } from './components/PomodoroView';
import { AiStudyView } from './components/AiStudyView';
import { EssayLabView } from './components/EssayLabView';
import { GardenView } from './components/GardenView';
import { SupportView } from './components/SupportView';
import { Login } from './components/Login';

export default function App() {
  // Estado para guardar se o usuário tá logado ou não
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('study_burrow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // User Stats State
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('study_burrow_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      streakDays: 3,
      xp: 65,
      maxXp: 100,
      level: 1,
      totalFocusMinutes: 50,
      completedPomodoros: 2,
      essaysGraded: 1,
      aiQuestionsAsked: 3,
    };
  });

  // Pomodoro State
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Sync stats to localStorage
  useEffect(() => {
    localStorage.setItem('study_burrow_stats', JSON.stringify(userStats));
  }, [userStats]);

  // Handle XP Addition & Level up
  const addXp = (amount: number) => {
    setUserStats((prev) => {
      let newXp = prev.xp + amount;
      let newMaxXp = prev.maxXp;
      let newLevel = prev.level;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.round(newMaxXp * 1.3);
      }

      return {
        ...prev,
        xp: newXp,
        maxXp: newMaxXp,
        level: newLevel,
      };
    });
  };

  // Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Timer finished!
      playChimeSound();
      if (mode === 'work') {
        addXp(25);
        setUserStats((prev) => ({
          ...prev,
          completedPomodoros: prev.completedPomodoros + 1,
          totalFocusMinutes: prev.totalFocusMinutes + 25,
        }));
        alert('🎉 Parabéns! Você concluiu uma sessão de foco de 25 minutos e ganhou +25 XP!');
      } else {
        alert('☕ Pausa concluída! Hora de renovar o foco na Toca.');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  // Audio chime synthesized
  const playChimeSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // ignore
    }
  };

  // Timer actions
  const handleStartTimer = () => {
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else if (mode === 'longBreak') setTimeLeft(15 * 60);
  };

  const handleSetMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'work') setTimeLeft(25 * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else if (newMode === 'longBreak') setTimeLeft(15 * 60);
  };

  const handleStartFocusFromNav = () => {
    setActiveTab('pomodoro');
    handleSetMode('work');
    setIsRunning(true);
  };

  // Se NÃO tiver usuário logado, mostra a tela de Login
  if (!user) {
    return <Login onLogin={(loggedUser) => setUser(loggedUser)} />;
  }

  return (
    <div className="bg-[#fdf9f0] text-[#1c1c17] font-body min-h-screen flex paper-texture select-none">
      {/* Desktop Side Navigation */}
<SidebarNav
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  onStartFocus={handleStartFocusFromNav}
  onLogout={() => {
    localStorage.removeItem('study_burrow_user');
    setUser(null);
  }}
/>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 pb-28 md:pb-12 max-w-7xl mx-auto w-full transition-all">
        {/* Global App Header */}
        <header className="mb-8 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-[#2e4e30] tracking-tight">
              Bem-vindo à Toca de Estudos, {user.name}!
            </h2>
            <p className="font-body text-base sm:text-lg text-[#424841] mt-1">
              Um espaço tranquilo para focar e crescer no seu ritmo.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-12 h-12 rounded-2xl bg-[#ece8df] border-2 border-[#7d5231] flex items-center justify-center text-[#7d5231] shadow-[0_4px_0_0_rgba(125,82,49,1)] active:translate-y-1 transition-transform cursor-pointer relative"
              title="Notificações"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#99462a] rounded-full border-2 border-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-14 w-72 bg-[#fdf9f0] border-2 border-[#7d5231] rounded-2xl p-4 shadow-lg z-50 font-body text-xs text-[#1c1c17] space-y-2">
                <div className="font-bold text-sm text-[#7d5231] border-b pb-2 flex justify-between">
                  <span>Avisos da Toca 🐰</span>
                  <button onClick={() => setNotificationsOpen(false)} className="text-[#99462a]">✕</button>
                </div>
                <p>• Você está em uma sequência de <strong>3 dias de estudo</strong>!</p>
                <p>• Lembre-se de tomar água durante suas pausas.</p>
              </div>
            )}
          </div>
        </header>

        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Progress & Action Cards */}
            <div className="lg:col-span-8 space-y-8">
              {/* Daily Progress Card */}
              <DailyProgressCard stats={userStats} />

              {/* Action Cards Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* AI Study Card */}
                <button
                  onClick={() => setActiveTab('ai-study')}
                  className="chunky-btn btn-secondary rounded-3xl text-left w-full cursor-pointer group"
                >
                  <div className="chunky-btn-inner bg-[#fe9572] border-2 border-[#99462a] rounded-3xl p-6 h-full flex flex-col justify-between hover:bg-[#fd835c] transition-colors">
                    <div className="w-14 h-14 bg-[#99462a] rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_4px_0_0_#7a2f15]">
                      <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="font-[#762c12] font-headline text-2xl font-bold mb-1">
                        Estudar com IA
                      </h3>
                      <p className="font-body text-sm text-[#390b00] leading-snug">
                        Sessões guiadas e amigáveis para revisar matérias difíceis.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Essay Lab Card */}
                <button
                  onClick={() => setActiveTab('essay-lab')}
                  className="chunky-btn btn-primary rounded-3xl text-left w-full cursor-pointer group"
                >
                  <div className="chunky-btn-inner bg-[#c6edc4] border-2 border-[#436444] rounded-3xl p-6 h-full flex flex-col justify-between hover:bg-[#b2e5af] transition-colors">
                    <div className="w-14 h-14 bg-[#436444] rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_4px_0_0_#2e4e30]">
                      <span className="material-symbols-outlined text-3xl">edit_note</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-[#012108] mb-1">
                        Corrigir Redação
                      </h3>
                      <p className="font-body text-sm text-[#2e4e30] leading-snug">
                        Feedback construtivo e gentil para melhorar sua escrita.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column: Floating Pomodoro Widget */}
            <div className="lg:col-span-4 lg:sticky lg:top-8">
              <PomodoroWidget
                timeLeft={timeLeft}
                isRunning={isRunning}
                mode={mode}
                onStart={handleStartTimer}
                onPause={handlePauseTimer}
                onReset={handleResetTimer}
                onSetMode={handleSetMode}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated Pomodoro View */}
        {activeTab === 'pomodoro' && (
          <PomodoroView
            timeLeft={timeLeft}
            isRunning={isRunning}
            mode={mode}
            onStart={handleStartTimer}
            onPause={handlePauseTimer}
            onReset={handleResetTimer}
            onSetMode={handleSetMode}
            onAddXp={addXp}
          />
        )}

        {/* Tab 3: AI Assistant */}
        {activeTab === 'ai-study' && <AiStudyView onAddXp={addXp} />}

        {/* Tab 4: Essay Lab */}
        {activeTab === 'essay-lab' && <EssayLabView onAddXp={addXp} />}

        {/* Tab 5: Achievements & Garden */}
        {activeTab === 'achievements' && <GardenView stats={userStats} onAddXp={addXp} />}

        {/* Tab 6: Support */}
        {activeTab === 'support' && <SupportView />}
      </main>
    </div>
  );
}