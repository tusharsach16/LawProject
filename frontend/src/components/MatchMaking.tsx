import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Shield } from 'lucide-react';
import { joinMockTrial, checkMatchStatus } from '../services/authService'; 

// Situation ka data 
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

    // Polling function to check for matches
    const pollForMatch = async () => {
        if (!side) return;
        
        try {
            const response = await checkMatchStatus(situation._id, side);
            
            if (response.matched) {
                console.log(`Match found! Navigating to trial ID: ${response.trialId}`);
                navigate(`/dashboard1/mock-trial/room/${response.trialId}`);
            } else if (!response.waiting) {
                // User is no longer in queue, something went wrong
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

    // Start polling when user starts waiting
    useEffect(() => {
        if (status === 'waiting' && side) {
            // Start polling every 2 seconds
            pollingIntervalRef.current = setInterval(pollForMatch, 2000);
        } else {
            // Clear polling when not waiting
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        }

        // Cleanup on unmount
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
            // Backend ko join request bheji
            const response = await joinMockTrial(situation._id, side);

            if (response.paired) {
                // Agar opponent mil gaya to trial room mein bhej dia
                console.log(`Paired! Navigating to trial ID: ${response.trialId}`);
                navigate(`/dashboard1/mock-trial/room/${response.trialId}`);
            } else if (response.waiting) {
                // Agar opponent nahi mil to intezaar kare
                console.log("Waiting for an opponent...");
                // Polling will start automatically via useEffect
            }
        } catch (err: any) {
            console.error("Failed to join trial:", err);
            const errorMessage = err.response?.data?.msg || "Could not join the trial. Please try again.";
            setError(errorMessage);
            setStatus('selecting'); // User ko dobara select karne ka mauka dein
        }
    };

    const handleCancel = () => {
        // Clear any polling
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md text-center p-6">
                <h2 className="text-xl font-bold text-gray-800">{situation.title}</h2>
                
                {status === 'selecting' && (
                    <>
                        <p className="text-gray-500 mt-2 mb-6">Choose your side to find an opponent.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setSide('plaintiff')} className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${side === 'plaintiff' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                <Scale className="text-blue-500" />
                                <span className="font-semibold">Plaintiff</span>
                            </button>
                            <button onClick={() => setSide('defendant')} className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${side === 'defendant' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                <Shield className="text-red-500" />
                                <span className="font-semibold">Defendant</span>
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button onClick={handleCancel} className="w-full py-3 font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
                            <button onClick={handleJoin} disabled={!side} className="w-full py-3 font-semibold text-white bg-black rounded-lg disabled:bg-gray-400 hover:bg-gray-800">Find Match</button>
                        </div>
                    </>
                )}

                {status === 'waiting' && (
                    <div className="py-8">
                        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
                        <p className="font-semibold mt-4">Waiting for an opponent...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take a few moments. Please don't close this window.</p>
                         <button onClick={handleCancel} className="mt-6 text-sm text-gray-500 hover:underline">Cancel Search</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Matchmaking;
