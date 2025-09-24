import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, Send, LogOut, Scale, Shield, RefreshCw } from 'lucide-react';
import { getMockTrialDetails, endTrial, leaveTrial, postMockMessage } from '../services/authService';
import { useAppSelector } from '../redux/hooks';

// Timer Component
const CountdownTimer = ({ startTime, onTimeUp }: { startTime: string; onTimeUp: () => void }) => {
    const calculateTimeLeft = () => {
        const durationInMinutes = 30;
        const endTime = new Date(new Date(startTime).getTime() + durationInMinutes * 60000);
        const difference = endTime.getTime() - new Date().getTime();
        
        if (difference > 0) {
            return {
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return { minutes: 0, seconds: 0 };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            if (newTimeLeft.minutes <= 0 && newTimeLeft.seconds <= 0 && timeLeft.minutes > 0) {
                onTimeUp();
            }
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className={`flex items-center gap-2 font-mono text-lg font-semibold ${timeLeft.minutes < 5 ? 'text-red-500' : 'text-gray-800'}`}>
            <Timer size={20} />
            <span>{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
    );
};

// Message Bubble Component
const MessageBubble = ({ message, isSender }: { message: any; isSender: boolean }) => (
    <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${isSender ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-black rounded-bl-none'}`}>
            <p className="text-sm">{message.text}</p>
        </div>
    </div>
);


const TrialRoomPage = () => {
    const { trialId } = useParams<{ trialId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAppSelector(state => state.user);
    
    const [trial, setTrial] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<null | HTMLDivElement>(null);
    
    // message send krne ke lie
    const [isSending, setIsSending] = useState(false);

    const fetchTrial = async () => {
        if (!trialId) return;
        try {
            setLoading(true);
            const data = await getMockTrialDetails(trialId);
            setTrial(data);
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Failed to fetch trial details:", error);
            alert("Could not load trial. Returning to lobby.");
            navigate('/dashboard1/mock-trials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrial();
    }, [trialId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!trialId || !newMessage.trim() || isSending) return;

        setIsSending(true); //  Message bhejna shuru, button disable karein
        try {
            const response = await postMockMessage(trialId, newMessage.trim());
            setMessages(prev => [...prev, response.message]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Could not send message.");
        } finally {
            setIsSending(false); // 2. Message chala gaya, button dobara enable karein
        }
    };
    
    const handleEndOrLeave = async (action: 'end' | 'leave') => {
        if (!trialId) return;
        const confirmMessage = action === 'leave' 
            ? "Are you sure you want to leave? The other participant will win."
            : "Are you sure you want to submit the trial for verdict?";
        
        if (window.confirm(confirmMessage)) {
            try {
                if (action === 'leave') {
                    await leaveTrial(trialId);
                    navigate('/dashboard1/mock-trials');
                } else {
                    await endTrial(trialId);
                    navigate(`/dashboard1/mock-trial/result/${trialId}`);
                }
            } catch (error) {
                console.error(`Failed to ${action} trial:`, error);
            }
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading Trial Room...</div>;
    }

    if (!trial) {
        return <div className="flex h-screen items-center justify-center">Trial not found. Returning to lobby...</div>;
    }

    const plaintiff = trial.plaintiffId;
    const defendant = trial.defendantId;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="flex items-center justify-between p-3 bg-white border-b shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <Scale size={20}/> {plaintiff?.username || 'Plaintiff'}
                    </div>
                    <span className="font-bold">VS</span>
                     <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <Shield size={20}/> {defendant?.username || 'Defendant'}
                    </div>
                </div>
                <CountdownTimer startTime={trial.startedAt} onTimeUp={() => handleEndOrLeave('end')} />
                <div className="flex items-center gap-4">
                    <button onClick={fetchTrial} className="p-2 rounded-full hover:bg-gray-100" title="Refresh messages">
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={() => handleEndOrLeave('leave')} className="flex items-center gap-2 text-sm text-red-500 font-semibold p-2 rounded-lg hover:bg-red-50">
                        <LogOut size={16} />
                        Leave
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} isSender={msg.senderId === currentUser?._id} />
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </main>

            <footer className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="relative">
                    <input 
                        type="text" 
                        placeholder="Type your argument..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending} // Jab message jaa raha ho, to input disable karein
                        className="w-full p-3 pr-14 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-200" 
                    />
                    <button 
                        type="submit" 
                        disabled={isSending} // Button ko bhi disable karein
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default TrialRoomPage;

