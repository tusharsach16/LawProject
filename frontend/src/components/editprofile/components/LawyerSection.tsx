import { Briefcase } from 'lucide-react';
import MultiSelectButton from './MultiSelectButton';

interface LawyerSectionProps {
  experience: number | '';
  licenseNumber: string;
  specialization: string[];
  allSpecializations: string[];
  onExperienceChange: (value: number) => void;
  onLicenseNumberChange: (value: string) => void;
  onSpecializationToggle: (spec: string) => void;
}

const LawyerSection = ({
  experience,
  licenseNumber,
  specialization,
  allSpecializations,
  onExperienceChange,
  onLicenseNumberChange,
  onSpecializationToggle
}: LawyerSectionProps) => {
  return (
    <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Briefcase size={20} className="text-blue-600" />
        Professional Details
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="number" 
            placeholder="Years of Experience" 
            value={experience} 
            onChange={(e) => onExperienceChange(Number(e.target.value))} 
            className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          />
          <input 
            type="text" 
            placeholder="License Number" 
            value={licenseNumber} 
            onChange={(e) => onLicenseNumberChange(e.target.value)} 
            className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-sm text-slate-700 mb-3">Specializations</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allSpecializations.map(spec => (
              <MultiSelectButton
                key={spec}
                item={spec}
                isSelected={specialization.includes(spec)}
                onToggle={() => onSpecializationToggle(spec)}
                colorScheme="blue"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerSection;