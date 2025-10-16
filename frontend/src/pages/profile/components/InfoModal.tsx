import type { InfoModalProps } from '../types/profile.types';

const InfoModal = ({ message, onClose }: InfoModalProps) => {
  if (!message) return null;
  const isError = message.type === 'error';
  
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-[200] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl text-center w-80 sm:w-96 border-2 border-slate-200 animate-scale-in">
        <div className={`h-2 rounded-t-2xl ${isError ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}></div>
        <div className="p-8">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isError ? 'bg-red-100' : 'bg-emerald-100'}`}>
            {isError ? (
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h3 className={`text-2xl font-bold mb-3 ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
            {isError ? 'Error' : 'Success'}
          </h3>
          <p className="text-slate-600 text-base">{message.text}</p>
          <button 
            onClick={onClose} 
            className="mt-6 px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;