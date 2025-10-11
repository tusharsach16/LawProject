import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Check, X, Users, Loader2 } from 'lucide-react';

interface FriendRequest {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    username: string;
    profileImageUrl?: string;
  };
}

interface FollowRequestsProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onResponse: (requestId: string, action: 'accept' | 'reject') => void;
  isProcessingId: string | null;
}

const FollowRequests = ({ isOpen, onClose, requests, onResponse, isProcessingId }: FollowRequestsProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-start z-[100] p-4 pt-[10vh] animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl border-2 border-slate-200 animate-slide-down overflow-hidden">
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-95"></div>
          <div className="relative flex items-center gap-4 p-4 border-b-2 border-amber-500/20">
            <button 
              onClick={onClose} 
              className="p-2.5 rounded-xl hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 transition-all duration-300 group"
            >
              <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <UserPlus size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Follow Requests</h2>
                <p className="text-xs text-slate-400">{requests.length} pending {requests.length === 1 ? 'request' : 'requests'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-50 to-slate-100">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Pending Requests</h3>
              <p className="text-slate-600 text-center max-w-sm">
                You don't have any follow requests at the moment. New requests will appear here.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {requests.map((req, index) => (
                <div 
                  key={req._id} 
                  className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300 group"
                  style={{
                    animation: `slideInRequest 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <Link 
                      to={`/dashboard1/profile/${req.senderId.username}`} 
                      onClick={onClose}
                      className="relative flex-shrink-0 group/avatar"
                    >
                      <div className="relative">
                        <img
                          src={req.senderId.profileImageUrl || 'https://placehold.co/150x150/1e293b/f59e0b?text=User'}
                          alt={req.senderId.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-200 border-2 border-slate-200 group-hover/avatar:border-amber-500 transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-slate-900/0 group-hover/avatar:bg-slate-900/10 transition-all duration-300"></div>
                      </div>
                    </Link>

                    <Link 
                      to={`/dashboard1/profile/${req.senderId.username}`}
                      onClick={onClose}
                      className="flex-1 min-w-0"
                    >
                      <p className="font-bold text-base text-slate-900 truncate hover:text-amber-600 transition-colors">
                        {req.senderId.name}
                      </p>
                      <p className="text-sm text-slate-500 truncate">@{req.senderId.username}</p>
                    </Link>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => onResponse(req._id, 'accept')}
                        disabled={!!isProcessingId}
                        className="p-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group/btn"
                        title="Accept"
                      >
                        {isProcessingId === req._id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Check size={18} className="group-hover/btn:scale-110 transition-transform" />
                        )}
                      </button>
                      <button
                        onClick={() => onResponse(req._id, 'reject')}
                        disabled={!!isProcessingId}
                        className="p-2.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-red-100 hover:text-red-600 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group/btn"
                        title="Reject"
                      >
                        {isProcessingId === req._id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <X size={18} className="group-hover/btn:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {requests.length > 0 && (
          <div className="px-5 py-3 bg-amber-50 border-t-2 border-amber-200">
            <p className="text-sm text-amber-800 text-center">
              💡 Click on a profile to view their details before accepting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowRequests;
