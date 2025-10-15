import { Loader2 } from 'lucide-react';

interface UnfollowModalProps {
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const UnfollowModal = ({ username, onConfirm, onCancel, isProcessing }: UnfollowModalProps) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl border-2 border-slate-200 animate-scale-in">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Unfollow @{username}?
        </h2>
        <p className="text-sm text-slate-600 mb-8">
          Their posts will no longer appear in your feed
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Unfollowing...
              </>
            ) : (
              'Unfollow'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full bg-white text-slate-900 font-semibold py-3 rounded-lg border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnfollowModal;