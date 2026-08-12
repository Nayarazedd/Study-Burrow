import React from 'react';
import { NavTab } from '../types';

interface SidebarNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onStartFocus: () => void;
  onLogout?: () => void; // <--- Adiciona essa linha aqui

}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onStartFocus,
  onLogout,
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: 'home' },
    { id: 'pomodoro' as NavTab, label: 'Pomodoro', icon: 'timer' },
    { id: 'ai-study' as NavTab, label: 'AI Assistant', icon: 'auto_awesome' },
    { id: 'essay-lab' as NavTab, label: 'Essay Lab', icon: 'edit_note' },
    { id: 'achievements' as NavTab, label: 'Achievements', icon: 'workspace_premium' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-72 left-0 top-0 fixed bg-[#f7f3ea] border-r-4 border-[#996a47] shadow-[4px_0_0_0_rgba(125,82,49,0.1)] py-8 gap-y-4 z-40 select-none">
      {/* Header Profile / Logo */}
      <div className="px-6 flex flex-col items-center mb-4">
        <div className="relative group cursor-pointer" onClick={() => setActiveTab('home')}>
  {/* Brilhos mais colados no coelho */}
  <span className="material-symbols-outlined absolute top-4 left-4 text-[#fe9572] text-xl animate-pulse">auto_awesome</span>
  <span className="material-symbols-outlined absolute top-20 right-0 text-[#fe9572] text-2xl animate-pulse delay-75">auto_awesome</span>
  <span className="material-symbols-outlined absolute bottom-8 left-0 text-[#fe9572] text-lg animate-pulse delay-150">auto_awesome</span>
  <span className="material-symbols-outlined absolute bottom-4 right-4 text-[#fe9572] text-xl animate-pulse delay-200">menu_book</span>
  <span className="material-symbols-outlined absolute bottom-4 right-4 text-[#fe9572] text-xl animate-pulse delay-65">menu_book</span>


  <img
    className="w-[17rem] h-auto mb-4 drop-shadow-xl transition-all duration-200 group-hover:scale-110 group-active:scale-95 group-active:drop-shadow-md"
    alt="Mascote Coelhinho"
    src="/coelho.png"
  />
</div>

        <h1 className="font-headline text-2xl font-bold text-[#7d5231] text-center tracking-tight">
          Study Burrow
        </h1>
        <p className="font-body text-sm font-semibold text-[#424841] text-center mt-0.5">
          Ready to grow?
        </p>

        {/* Start Focus Button */}
        <button
          onClick={onStartFocus}
          className="mt-5 w-full chunky-btn btn-primary rounded-xl overflow-hidden cursor-pointer"
        >
          <span className="chunky-btn-inner bg-[#436444] hover:bg-[#385439] text-white font-body font-bold text-sm py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-xl">timer</span>
            Start Focus Session
          </span>
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full rounded-xl flex items-center gap-4 p-3.5 mx-0 transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-[#5b7d5b] text-[#f7fff2] shadow-[0_4px_0_0_rgba(67,100,68,1)] font-bold'
                  : 'text-[#424841] hover:bg-[#ece8df] hover:translate-x-1 font-semibold'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              <span className="font-body text-base">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Nav Links */}
      <div className="px-4 mt-auto pt-2 border-t border-[#e6e2d9]/60 flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('support')}
          className={`w-full rounded-xl flex items-center gap-4 p-3 mx-0 transition-all duration-150 cursor-pointer text-left ${
            activeTab === 'support'
              ? 'bg-[#e6e2d9] text-[#7d5231] font-bold'
              : 'text-[#424841] hover:bg-[#ece8df] font-semibold'
          }`}
        >
          <span className="material-symbols-outlined text-xl">help</span>
          <span className="font-body text-sm">Support</span>
        </button>

        <button
  onClick={() => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('study_burrow_user');
      window.location.reload();
    }
  }}
  className="w-full text-[#424841] hover:bg-[#ece8df] hover:text-[#ba1a1a] rounded-xl flex items-center gap-4 p-3 transition-all duration-150 cursor-pointer font-semibold"
>
  <span className="material-symbols-outlined text-xl">logout</span>
  <span className="font-body text-sm">Log Out</span>
</button>
      </div>
    </nav>
  );
};
