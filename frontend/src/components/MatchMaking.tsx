import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Shield, Loader2, X } from 'lucide-react';
import { joinMockTrial, checkMatchStatus } from '../services/authService'; 

interface Situation {
  _id: string;
  title: string;
}

interface MatchmakingProps {
    situation: Situation;
    onClose: () => void;
}

const Matchmaking = ({ situation, onClose }: MatchmakingProps) => {
    const [side, setSide] = useState<'plaintiff' | 'defendant' | null>(null);
    const [status, setStatus] = useState<'selecting' | 'waiting' | 'paired'>('selecting');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const pollForMatch = async () => {
        if (!side) return;
        
        try {
            const response = await checkMatchStatus(situation._id, side);
            
            if (response.matched) {
                console.log(`Match found! Navigating to trial ID: ${response.trialId}`);
                navigate(`/dashboard/mock-trial/room/${response.trialId}`);
            } else if (!response.waiting) {
                setError("Connection lost. Please try again.");
                setStatus('selecting');
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
            }
        } catch (err) {
            console.error("Error checking match status:", err);
        }
    };

    useEffect(() => {
        if (status === 'waiting' && side) {
            pollingIntervalRef.current = setInterval(pollForMatch, 2000);
        } else {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [status, side]);

    const handleJoin = async () => {
        if (!side) {
            alert("Please select a side.");
            return;
        }
        setStatus('waiting');
        setError(null);
        
        try {
            const response = await joinMockTrial(situation._id, side);

            if (response.paired) {
                console.log(`Paired! Navigating to trial ID: ${response.trialId}`);
                navigate(`/dashboard/mock-trial/room/${response.trialId}`);
            } else if (response.waiting) {
                console.log("Waiting for an opponent...");
            }
        } catch (err: any) {
            console.error("Failed to join trial:", err);
            const errorMessage = err.response?.data?.msg || "Could not join the trial. Please try again.";
            setError(errorMessage);
            setStatus('selecting');
        }
    };

    const handleCancel = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border-2 border-slate-200 animate-slide-up">
                <div className="relative border-b-2 border-slate-200 p-6">
                    <button 
                        onClick={handleCancel}
                        className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 pr-8">{situation.title}</h2>
                </div>
                
                <div className="p-6">
                    {status === 'selecting' && (
                        <>
                            <p className="text-slate-600 mb-6 text-center">Choose your side to find an opponent</p>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button 
                                    onClick={() => setSide('plaintiff')} 
                                    className={`p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${
                                        side === 'plaintiff' 
                                            ? 'border-slate-900 bg-slate-50 shadow-md' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Scale size={32} className={side === 'plaintiff' ? 'text-slate-900' : 'text-slate-400'} strokeWidth={1.5} />
                                    <span className={`font-semibold ${side === 'plaintiff' ? 'text-slate-900' : 'text-slate-600'}`}>
                                        Plaintiff
                                    </span>
                                </button>
                                <button 
                                    onClick={() => setSide('defendant')} 
                                    className={`p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${
                                        side === 'defendant' 
                                            ? 'border-slate-900 bg-slate-50 shadow-md' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Shield size={32} className={side === 'defendant' ? 'text-slate-900' : 'text-slate-400'} strokeWidth={1.5} />
                                    <span className={`font-semibold ${side === 'defendant' ? 'text-slate-900' : 'text-slate-600'}`}>
                                        Defendant
                                    </span>
                                </button>
                            </div>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleCancel} 
                                    className="flex-1 py-3 font-semibold text-slate-700 border-2 border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleJoin} 
                                    disabled={!side} 
                                    className="flex-1 py-3 font-semibold text-white bg-slate-900 rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                                >
                                    Find Match
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'waiting' && (
                        <div className="py-12 text-center">
                            <Loader2 className="h-12 w-12 text-slate-900 animate-spin mx-auto mb-6" strokeWidth={2} />
                            <p className="text-lg font-semibold text-slate-900 mb-2">Finding opponent...</p>
                            <p className="text-sm text-slate-600 mb-8">This may take a few moments</p>
                            <button 
                                onClick={handleCancel} 
                                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                            >
                                Cancel Search
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Matchmaking;