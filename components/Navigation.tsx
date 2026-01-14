
import React from 'react';
import { Calendar, Target, Clock, BarChart3 } from 'lucide-react';
import { Tab } from '../types';

interface NavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Navigation: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.CALENDAR, icon: Calendar, label: 'Daily', color: 'text-indigo-400' },
    { id: Tab.PLANNING, icon: Target, label: 'Goals', color: 'text-purple-400' },
    { id: Tab.DIGITAL, icon: Clock, label: 'Digital', color: 'text-cyan-400' },
    { id: Tab.ANALYTICS, icon: BarChart3, label: 'Log', color: 'text-emerald-400' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/10 px-8 py-4 flex gap-8 md:gap-12 items-center rounded-full backdrop-blur-2xl shadow-2xl z-50">
      {navItems.map(({ id, icon: Icon, label, color }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center transition-all ${
            activeTab === id ? `${color} scale-110` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Icon className="w-6 h-6 mb-1" />
          <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
      ))}
    </nav>
  );
};
