import { Camera } from 'lucide-react';

interface BannerSectionProps {
  bannerImagePreview: string | null;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BannerSection = ({ bannerImagePreview, onImageSelect }: BannerSectionProps) => {
  return (
    <div className="relative h-52 bg-gradient-to-br from-slate-800 to-slate-900">
      {bannerImagePreview && (
        <img src={bannerImagePreview} alt="Banner" className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <label htmlFor="banner-upload" className="cursor-pointer p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border-2 border-amber-500/30 hover:border-amber-500 transition-all duration-300 group">
          <Camera size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <input 
            id="banner-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onImageSelect} 
          />
        </label>
      </div>
    </div>
  );
};

export default BannerSection;