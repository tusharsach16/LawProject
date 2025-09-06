import React from 'react';

interface UnfollowModalProps {
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean; // Loading state ke liye
}

const UnfollowModal = ({ username, onConfirm, onCancel, isProcessing }: UnfollowModalProps) => {
  return (
    <div className="fixed inset-0 bg-opacity-80 backdrop-blur-sm  flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Unfollow @{username}?</h2>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 disabled:bg-red-300 transition-colors"
          >
            {isProcessing ? 'Unfollowing...' : 'Unfollow'}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full bg-white text-black font-bold py-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnfollowModal;

