import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMockTrialDetails, analyzeTrial } from '../services/authService';
import { Scale, Trophy, Gavel, FileText, Loader2, ArrowLeft, Sparkles } from 'lucide-react';

const TrialResultPage = () => {
    const { trialId } = useParams<{ trialId: string }>();
    const navigate = useNavigate();
    const [trialResult, setTrialResult] = useState<any>(null);
    const [loadingMessage, setLoadingMessage] = useState("Analyzing your trial, please wait...");
    const analysisTriggered = useRef(false);

    useEffect(() => {
        if (!trialId) return;

        const fetchAndAnalyze = async () => {
            try {
                const data = await getMockTrialDetails(trialId);
                console.log("Trial details fetched:", data);

                // Also handle 'left' status which was missing
                if (data.status === 'completed' || data.status === 'ended' || data.status === 'left') {
                    // Trigger analysis if it hasn't been done yet
                    if (!data.judgementText && !analysisTriggered.current && data.status !== 'left') {
                        console.log("Judgement missing, triggering analysis...");
                        analysisTriggered.current = true;
                        try {
                            await analyzeTrial(trialId);
                        } catch (err) {
                            console.error("Failed to trigger analysis:", err);
                        }
                    }

                    // If we have a judgement or it's a 'left' trial (which has an immediate winner), search is over
                    if (data.judgementText || data.status === 'left') {
                        setTrialResult(data);
                        return true; // Stop polling
                    }
                }
            } catch (error) {
                console.error("Error fetching trial details:", error);
                setLoadingMessage("Could not fetch results. Please check your dashboard.");
                return true; // Stop polling
            }
            return false;
        };

        // Hold the interval ID in the synchronous scope so the cleanup
        // function returned below can always cancel it, even if the component
        // unmounts before the initial fetch resolves.
        let intervalId: ReturnType<typeof setInterval> | undefined;

        fetchAndAnalyze().then(shouldStop => {
            if (shouldStop) return;

            intervalId = setInterval(async () => {
                const stop = await fetchAndAnalyze();
                if (stop) {
                    clearInterval(intervalId);
                    intervalId = undefined;
                }
            }, 3000);
        });

        // This cleanup is returned synchronously, so React will always call it
        // on unmount regardless of when (or whether) the promise resolved.
        return () => {
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
        };

    }, [trialId]);

    if (!trialResult) {
        // ... (rest of the loading UI remains similar)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="text-center">
                    <div className="relative mb-8">
                        <Scale className="h-20 w-20 text-amber-500 animate-pulse mx-auto" />
                        <Loader2 className="h-10 w-10 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 max-w-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
                            <Sparkles className="h-6 w-6 text-amber-500" />
                            Analyzing Trial
                        </h3>
                        <p className="text-slate-600">{loadingMessage}</p>
                        <div className="mt-6 flex justify-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const plaintiffIdStr = typeof trialResult.plaintiffId === 'object' ? trialResult.plaintiffId._id : trialResult.plaintiffId;
    const isPlaintiffWinner = trialResult.winnerId === plaintiffIdStr;
    const winnerSide = isPlaintiffWinner ? 'Plaintiff' : 'Defendant';
    const winnerColor = isPlaintiffWinner ? 'from-slate-700 to-slate-900' : 'from-slate-800 to-slate-950';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 hover:border-amber-500/30 hover:shadow-md transition-all duration-300 flex items-center gap-2 font-semibold"
                >
                    <ArrowLeft size={20} />
                    Back to Trials
                </button>

                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-30 animate-pulse"></div>
                            <div className="relative p-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-2xl">
                                <Gavel size={64} className="text-white" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
                        Trial Results
                        <FileText className="h-8 w-8 text-amber-500" />
                    </h1>
                    <p className="text-slate-600 text-lg">The verdict has been delivered</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden animate-slide-up">
                    <div className={`p-8 bg-gradient-to-r ${winnerColor} text-white`}>
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Trophy className="h-12 w-12" />
                            <h2 className="text-3xl font-bold">Winner Declared</h2>
                        </div>
                        <div className="text-center">
                            <div className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                                <p className="text-sm font-semibold uppercase tracking-wider mb-1 opacity-90">Victory Goes To</p>
                                <p className="text-4xl font-black">{winnerSide}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Scale className="h-6 w-6 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Judge's Justification</h3>
                            </div>
                            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm">
                                <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                                    {trialResult.judgementText || 'No justification provided.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/dashboard/past-trials')}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                View All Trials
                                <ArrowLeft className="h-5 w-5 rotate-180" />
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/mock-trials')}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Start New Trial
                                <Sparkles className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Trial ID: <span className="font-mono text-slate-700">{trialId}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrialResultPage;