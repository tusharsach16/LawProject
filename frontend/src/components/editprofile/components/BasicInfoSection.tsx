import { User, MessageSquare, MapPin } from 'lucide-react';

interface BasicInfoSectionProps {
  name: string;
  bio: string;
  location: string;
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

const BasicInfoSection = ({ 
  name, 
  bio, 
  location, 
  onNameChange, 
  onBioChange, 
  onLocationChange 
}: BasicInfoSectionProps) => {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <User size={20} className="text-amber-500" />
        Basic Information
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
          <input 
            type="text" 
            placeholder="Your full name" 
            value={name} 
            onChange={(e) => onNameChange(e.target.value)} 
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <MessageSquare size={16} className="text-slate-500" />
            Bio
          </label>
          <textarea 
            placeholder="Tell us about yourself..." 
            value={bio} 
            onChange={(e) => onBioChange(e.target.value)} 
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
            rows={4}
          />
        </div>
        
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <MapPin size={16} className="text-slate-500" />
            Location
          </label>
          <input 
            type="text" 
            placeholder="City, State" 
            value={location} 
            onChange={(e) => onLocationChange(e.target.value)} 
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;