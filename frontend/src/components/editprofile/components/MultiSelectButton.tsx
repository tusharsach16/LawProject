import { CheckSquare, Square } from 'lucide-react';

interface MultiSelectButtonProps {
  item: string;
  isSelected: boolean;
  onToggle: () => void;
  colorScheme: 'purple' | 'blue' | 'rose';
}

const MultiSelectButton = ({ item, isSelected, onToggle, colorScheme }: MultiSelectButtonProps) => {
  const colorClasses = {
    purple: {
      selected: 'bg-purple-100 border-purple-400 text-purple-900',
      unselected: 'bg-white border-slate-200 text-slate-700 hover:border-purple-300',
      icon: 'text-purple-600'
    },
    blue: {
      selected: 'bg-blue-100 border-blue-400 text-blue-900',
      unselected: 'bg-white border-slate-200 text-slate-700 hover:border-blue-300',
      icon: 'text-blue-600'
    },
    rose: {
      selected: 'bg-rose-100 border-rose-400 text-rose-900',
      unselected: 'bg-white border-slate-200 text-slate-700 hover:border-rose-300',
      icon: 'text-rose-600'
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <button 
      type="button" 
      onClick={onToggle} 
      className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border-2 transition-all duration-300 ${
        isSelected ? `${colors.selected} font-semibold` : colors.unselected
      }`}
    >
      {isSelected ? 
        <CheckSquare size={16} className={`${colors.icon} flex-shrink-0`} /> : 
        <Square size={16} className="text-slate-400 flex-shrink-0" />
      }
      <span className="truncate">{item}</span>
    </button>
  );
};

export default MultiSelectButton;