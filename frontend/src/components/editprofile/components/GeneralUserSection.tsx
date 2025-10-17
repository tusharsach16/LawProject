import { Heart } from 'lucide-react';
import MultiSelectButton from './MultiSelectButton';

interface GeneralUserSectionProps {
  interests: string[];
  allSpecializations: string[];
  onInterestToggle: (spec: string) => void;
}

const GeneralUserSection = ({
  interests,
  allSpecializations,
  onInterestToggle
}: GeneralUserSectionProps) => {
  return (
    <div className="bg-rose-50 rounded-xl p-5 border-2 border-rose-200">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Heart size={20} className="text-rose-600" />
        Your Interests
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allSpecializations.map(spec => (
          <MultiSelectButton
            key={spec}
            item={spec}
            isSelected={interests.includes(spec)}
            onToggle={() => onInterestToggle(spec)}
            colorScheme="rose"
          />
        ))}
      </div>
    </div>
  );
};

export default GeneralUserSection;