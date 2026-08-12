import React from 'react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 px-3 bg-[#f1eee5] rounded-t-3xl border-t-4 border-[#996a47] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] pb-4 select-none">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'bg-[#fe9572] text-[#762c12] shadow-[0_3px_0_0_#762c12] font-bold'
            : 'text-[#424841] hover:text-[#436444]'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">cottage</span>
        <span className="font-body text-xs mt-0.5 font-bold">Burrow</span>
      </button>

      <button
        onClick={() => setActiveTab('pomodoro')}
        className={`flex flex-col items-center px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'pomodoro'
            ? 'bg-[#fe9572] text-[#762c12] shadow-[0_3px_0_0_#762c12] font-bold'
            : 'text-[#424841] hover:text-[#436444]'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">timer</span>
        <span className="font-body text-xs mt-0.5 font-bold">Pomodoro</span>
      </button>

      <button
        onClick={() => setActiveTab('ai-study')}
        className={`flex flex-col items-center px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'ai-study'
            ? 'bg-[#fe9572] text-[#762c12] shadow-[0_3px_0_0_#762c12] font-bold'
            : 'text-[#424841] hover:text-[#436444]'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
        <span className="font-body text-xs mt-0.5 font-bold">IA</span>
      </button>

      <button
        onClick={() => setActiveTab('essay-lab')}
        className={`flex flex-col items-center px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'essay-lab'
            ? 'bg-[#fe9572] text-[#762c12] shadow-[0_3px_0_0_#762c12] font-bold'
            : 'text-[#424841] hover:text-[#436444]'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">edit_note</span>
        <span className="font-body text-xs mt-0.5 font-bold">Redação</span>
      </button>

      <button
        onClick={() => setActiveTab('achievements')}
        className={`flex flex-col items-center px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'achievements'
            ? 'bg-[#fe9572] text-[#762c12] shadow-[0_3px_0_0_#762c12] font-bold'
            : 'text-[#424841] hover:text-[#436444]'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">local_florist</span>
        <span className="font-body text-xs mt-0.5 font-bold">Jardim</span>
      </button>
    </nav>
  );
};
