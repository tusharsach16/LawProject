import { X, Scale, Save } from 'lucide-react';

interface ModalHeaderProps {
  onClose: () => void;
  onSave: () => void;
}

const ModalHeader = ({ onClose, onSave }: ModalHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b-2 border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-2xl">
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose} 
          className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 transition-all duration-300 group"
        >
          <X size={22} className="group-hover:rotate-90 transition-transform" />
        </button>
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        </div>
      </div>
      <button 
        onClick={onSave} 
        className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <Save size={18} />
        Save
      </button>
    </header>
  );
};

export default ModalHeader;