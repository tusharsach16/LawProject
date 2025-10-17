import { Edit2 } from 'lucide-react';

interface ProfileBannerProps {
  bannerImageUrl?: string;
  onEditClick: () => void;
}

export const ProfileBanner = ({ bannerImageUrl, onEditClick }: ProfileBannerProps) => {
  const bannerImg = bannerImageUrl || 'https://placehold.co/600x200/1e293b/f59e0b?text=Banner';

  return (
    <div className="relative">
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img 
          src={bannerImg} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/60"></div>
      </div>
      
      <div className="absolute top-4 right-4">
        <button
          onClick={onEditClick}
          className="bg-slate-900/80 backdrop-blur-sm text-white border-2 border-amber-500/30 rounded-xl py-2.5 px-5 font-bold text-sm hover:bg-slate-900 hover:border-amber-500 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-xl group"
        >
          <Edit2 size={16} className="group-hover:rotate-12 transition-transform" />
          Edit profile
        </button>
      </div>
    </div>
  );
};