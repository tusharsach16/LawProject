import { BookOpen } from 'lucide-react';
import MultiSelectButton from './MultiSelectButton';

interface LawStudentSectionProps {
  collegeName: string;
  year: number | '';
  enrollmentNumber: string;
  areaOfInterest: string[];
  allSpecializations: string[];
  onCollegeNameChange: (value: string) => void;
  onYearChange: (value: number) => void;
  onEnrollmentNumberChange: (value: string) => void;
  onAreaOfInterestToggle: (spec: string) => void;
}

const LawStudentSection = ({
  collegeName,
  year,
  enrollmentNumber,
  areaOfInterest,
  allSpecializations,
  onCollegeNameChange,
  onYearChange,
  onEnrollmentNumberChange,
  onAreaOfInterestToggle
}: LawStudentSectionProps) => {
  return (
    <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <BookOpen size={20} className="text-purple-600" />
        Student Details
      </h3>
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="College Name" 
          value={collegeName} 
          onChange={(e) => onCollegeNameChange(e.target.value)} 
          className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
        />
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="number" 
            placeholder="Year of Study" 
            value={year} 
            onChange={(e) => onYearChange(Number(e.target.value))} 
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
          />
          <input 
            type="text" 
            placeholder="Enrollment Number" 
            value={enrollmentNumber} 
            onChange={(e) => onEnrollmentNumberChange(e.target.value)} 
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-sm text-slate-700 mb-3">Areas of Interest</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allSpecializations.map(spec => (
              <MultiSelectButton
                key={spec}
                item={spec}
                isSelected={areaOfInterest.includes(spec)}
                onToggle={() => onAreaOfInterestToggle(spec)}
                colorScheme="purple"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawStudentSection;