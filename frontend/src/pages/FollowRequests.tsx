import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Friend Request ka data kaisa dikhega uske liye type
interface FriendRequest {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    username: string;
    profileImageUrl?: string;
  };
}

// Modal ke props
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center z-[100] p-4 pt-[10vh]">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center p-3 border-b border-gray-200">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h2 className="ml-4 font-bold text-lg">Follow requests</h2>
        </header>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {requests.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No pending follow requests.</p>
          ) : (
            <div className="p-2">
              {requests.map((req) => (
                <div key={req._id} className="flex items-center justify-between p-2 rounded-lg">
                  <Link to={`/dashboard1/profile/${req.senderId.username}`} className="flex items-center gap-3" onClick={onClose}>
                    <img
                      src={req.senderId.profileImageUrl || 'https://placehold.co/150x150/a7a7a7/ffffff?text=User'}
                      alt={req.senderId.name}
                      className="w-11 h-11 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm hover:underline">{req.senderId.username}</p>
                      <p className="text-sm text-gray-500">{req.senderId.name}</p>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onResponse(req._id, 'accept')}
                      disabled={!!isProcessingId}
                      className="px-4 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isProcessingId === req._id ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => onResponse(req._id, 'reject')}
                      disabled={!!isProcessingId}
                      className="px-4 py-1.5 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                      {isProcessingId === req._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowRequests;