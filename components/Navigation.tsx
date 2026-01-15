
import React from 'react';
import { Calendar, Target, Clock } from 'lucide-react';
import { Tab } from '../types';

interface NavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Navigation: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    // Fixed: Changed CALENDAR to TODAY, PLANNING to UPCOMING, and DIGITAL to BROWSE to match types.ts
    { id: Tab.TODAY, icon: Calendar, label: 'Daily', color: 'text-indigo-400' },
    { id: Tab.UPCOMING, icon: Target, label: 'Goals', color: 'text-purple-400' },
    { id: Tab.BROWSE, icon: Clock, label: 'Digital', color: 'text-cyan-400' },
  ];

  return (
    <nav className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/10 px-6 py-3 md:px-8 md:py-4 flex gap-6 md:gap-12 items-center rounded-full backdrop-blur-2xl shadow-2xl z-50 w-[90%] md:w-auto justify-center">
      {navItems.map(({ id, icon: Icon, label, color }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center transition-all ${
            activeTab === id ? `${color} scale-110` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6 mb-1" />
          <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
      ))}
    </nav>
  );
};