import { Camera } from 'lucide-react';

interface ProfilePictureSectionProps {
  profileImagePreview: string | null;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePictureSection = ({ profileImagePreview, onImageSelect }: ProfilePictureSectionProps) => {
  return (
    <div className="relative w-36 h-36 rounded-2xl border-4 border-white bg-slate-200 -mt-20 ml-6 shadow-2xl">
      {profileImagePreview && (
        <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
      )}
      <label 
        htmlFor="profile-upload" 
        className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-2xl bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-sm transition-all duration-300 group"
      >
        <Camera size={28} className="text-amber-400 group-hover:scale-110 transition-transform" />
        <input 
          id="profile-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={onImageSelect} 
        />
      </label>
    </div>
  );
};

export default ProfilePictureSection;