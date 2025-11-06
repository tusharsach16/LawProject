import { ArrowLeft, Search, Scale } from 'lucide-react';
import type { ProfileHeaderProps } from '../types/profile.types';

const ProfileHeader = ({ name, onSearchClick }: ProfileHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-sm border-b-2 border-amber-500/20 shadow-lg">
      <button 
        onClick={() => window.history.back()}
        className="p-2.5 rounded-xl hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 transition-all duration-300 group"
      >
        <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
      </button>
      
      <div className="text-center">
        <h2 className="font-bold text-xl text-white leading-tight flex items-center gap-2">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-2 rounded-xl shadow-lg border border-slate-700">
            <Scale id="logo" className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          {name}
        </h2>
      </div>

      <button 
        onClick={onSearchClick} 
        className="p-2.5 rounded-xl hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 transition-all duration-300 group"
      >
        <Search size={22} className="group-hover:scale-110 transition-transform" />
      </button>
    </header>
  );
};

export default ProfileHeader;