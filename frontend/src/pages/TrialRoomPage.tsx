import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, Scale, Shield, Timer } from 'lucide-react';
import { getMockTrialDetails, endTrial, leaveTrial, analyzeTrial} from '../services/authService';
import { useAppSelector } from '../redux/hooks';


const CountdownTimer = ({ startTime, onTimeUp }: { startTime: string; onTimeUp: () => void }) => {
    const calculateTimeLeft = () => {
        const durationInMinutes = 15; 
        const endTime = new Date(new Date(startTime).getTime() + durationInMinutes * 60000);
        return endTime.getTime() - new Date().getTime();
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const intervalId = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 0) {
                onTimeUp();
                clearInterval(intervalId); // Stop the timer once finished
            }
        }, 1000);

        // This cleans up the timer if user leave the page
        return () => clearInterval(intervalId);

    }, [startTime, onTimeUp]); 

    // Calculate minutes and seconds from milliseconds
    const minutes = Math.max(0, Math.floor((timeLeft / 1000 / 60) % 60));
    const seconds = Math.max(0, Math.floor((timeLeft / 1000) % 60));

    return (
        <div className={`flex items-center gap-2 font-mono text-lg font-semibold ${minutes < 1 ? 'text-red-500' : 'text-gray-800'}`}>
            <Timer size={20} />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
};

const MessageBubble = ({ message, isSender }: { message: any; isSender: boolean }) => (
    <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${isSender ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-black rounded-bl-none'}`}>
            <p className="text-sm">{message.text}</p>
            <p className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </p>
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
    const socketRef = useRef<WebSocket | null>(null); // WebSocket connection ko store karega
    const chatEndRef = useRef<null | HTMLDivElement>(null);

    // Trial details fetch karna or WebSocket connection banana
    useEffect(() => {
        if (!trialId || !currentUser) return;

        // Pehle trial ki details fetch kari
        const fetchTrial = async () => {
            try {
                const data = await getMockTrialDetails(trialId);
                setTrial(data);
                setMessages(data.messages || []);
            } catch (error) {
                navigate('/dashboard/mock-trials');
            } finally {
                setLoading(false);
            }
        };
        fetchTrial();

        const token = localStorage.getItem('token');
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        
        const connectWebSocket = () => {
            //  Backend WebSocket server se connect kara
            const socket = new WebSocket(`ws://localhost:5000?trialId=${trialId}&token=${token}`);
            socketRef.current = socket;

            // if connection is succcessfull
            socket.onopen = () => {
                console.log("WebSocket connection established.");
                reconnectAttempts = 0; // Reset reconnection attempts on successful connection
            };

            // Jab server se koi naya message aaye
            socket.onmessage = (event) => {
                const receivedData = JSON.parse(event.data);
                console.log('Received WebSocket message:', receivedData);
                
                if (receivedData.type === 'message') {
                    // Naye message ko state mein add karein
                    setMessages(prev => [...prev, receivedData.data]);
                }
            };

            // Jab connection band ho
            socket.onclose = (event) => {
                console.log("WebSocket connection closed:", event.code, event.reason);
                
                // Attempt to reconnect if not a normal closure
                if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
                    setTimeout(() => {
                        connectWebSocket();
                    }, 2000 * reconnectAttempts); // Exponential backoff
                }
            };

            // Agar koi error aaye
            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        };
        
        connectWebSocket();

        // Component ke band hone par connection saaf karein (imp)
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };

    }, [trialId, currentUser, navigate]);

    // Naye messages ke liye neeche scroll karein
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const messageData = {
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        // Message ko WebSocket ke zariye server ko bhej diya
        socketRef.current.send(JSON.stringify(messageData));
        
        // Clear input immediately
        setNewMessage('');
        
        // Note: Message will be added to state when received back from server
        // This ensures all clients see the same message with proper formatting
    };
    
    const handleEndOrLeave = async (action: 'end' | 'leave') => {
        if (!trialId) return;
        
        try {
            if (action === 'end') {
                await endTrial(trialId);
            } else {
                await leaveTrial(trialId);
            }
            navigate('/dashboard/mock-trials');
        } catch (error) {
            console.error(`Failed to ${action} trial:`, error);
        }
    };

    const handleTimeUp = async () => {
        if (!trialId) return;
        try {
            // Trigger the analysis on the backend
            analyzeTrial(trialId);
            // Immediately navigate to the results page
            navigate(`/dashboard/trial-result/${trialId}`);
        } catch (error) {
            console.error("Failed to start analysis:", error);
            navigate('/dashboard/mock-trials'); // Fallback on error
        }
    };  

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading trial room...</p>
                </div>
            </div>
        );
    }

    if (!trial) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Trial not found</p>
                    <button 
                        onClick={() => navigate('/dashboard/mock-trials')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Trials
                    </button>
                </div>
            </div>
        );
    }

    const plaintiff = trial.plaintiffId;
    const defendant = trial.defendantId;

    // Debug: Log trial data to see the structure
    console.log('Trial data:', trial);
    console.log('Plaintiff:', plaintiff);
    console.log('Defendant:', defendant);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="flex items-center justify-between p-3 bg-white border-b shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <Scale size={20}/> {plaintiff?.username || plaintiff?.name || 'Plaintiff'}
                    </div>
                    <span className="font-bold">VS</span>
                     <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <Shield size={20}/> {defendant?.username || defendant?.name || 'Defendant'}
                    </div>
                </div>
                <CountdownTimer startTime={trial.startedAt} onTimeUp={handleTimeUp} />
                <button onClick={() => handleEndOrLeave('leave')} className="flex items-center gap-2 text-sm text-red-500 font-semibold p-2 rounded-lg hover:bg-red-50">
                    <LogOut size={16} />
                    Leave
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        // Debug: Log message data to see senderId structure
                        console.log('Message:', msg, 'Current User ID:', currentUser?._id);
                        const isSender = msg.senderId === currentUser?._id || msg.senderId?.toString() === currentUser?._id?.toString();
                        return (
                            <MessageBubble key={index} message={msg} isSender={isSender} />
                        );
                    })}
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
                        className="w-full p-3 pr-14 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black" 
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full hover:bg-gray-800">
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default TrialRoomPage;

