import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMockTrialDetails } from '../services/authService'; 

const TrialResultPage = () => {
    const { trialId } = useParams<{ trialId: string }>();
    const [trialResult, setTrialResult] = useState<any>(null);
    const [loadingMessage, setLoadingMessage] = useState("Analyzing your trial, please wait...");

    useEffect(() => {
        if (!trialId) return;

        // Interval shuru karo jo har 3 second mein check karega
        const intervalId = setInterval(async () => {
            try {
                const data = await getMockTrialDetails(trialId);
                
                // Check karo ki status completed ho gaya hai kya
                if (data.status === 'completed' || data.status === 'ended') {
                    setTrialResult(data); 
                    clearInterval(intervalId); // Interval ko rok do
                }
            } catch (error) {
                console.error("Error fetching trial details:", error);
                setLoadingMessage("Could not fetch results. Please check your dashboard.");
                clearInterval(intervalId); // Error aane par bhi interval rok do
            }
        }, 3000); 

        // Cleanup function agar user page chhod de to interval band ho jaye
        return () => clearInterval(intervalId);

    }, [trialId]);

    // loading message 
    if (!trialResult) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{loadingMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center">Trial Results 📜</h1>
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">
                    Winner: 
                    <span className="font-bold ml-2 text-green-600">
                        {trialResult.winnerId === trialResult.plaintiffId ? 'Plaintiff' : 'Defendant'}
                    </span>
                </h2>
                <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold text-gray-800">Judge's Justification:</h3>
                    <p className="mt-2 text-gray-600">{trialResult.judgementText}</p>
                </div>
            </div>
        </div>
    );
};

export default TrialResultPage;