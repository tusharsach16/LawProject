import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, Scale, Shield, Timer, Loader2 } from 'lucide-react';
import { getMockTrialDetails, endTrial, leaveTrial, analyzeTrial } from '../services/authService';
import { useAppSelector } from '../redux/hooks';
import MessageBubble, {type Message } from '../components/MessageBubble';
import { getWebSocketUrl } from '../lib/utils';

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
                clearInterval(intervalId);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [startTime, onTimeUp]); 

    const minutes = Math.max(0, Math.floor((timeLeft / 1000 / 60) % 60));
    const seconds = Math.max(0, Math.floor((timeLeft / 1000) % 60));

    return (
        <div className={`flex items-center gap-2 font-mono text-lg font-semibold ${minutes < 1 ? 'text-red-500' : 'text-gray-800'}`}>
            <Timer size={20} />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
};

const TrialRoomPage = () => {
    const { trialId } = useParams<{ trialId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAppSelector(state => state.user);
    
    const [trial, setTrial] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [trialEnded, setTrialEnded] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const chatEndRef = useRef<null | HTMLDivElement>(null);

    const isConnecting = useRef(false);

    useEffect(() => {
        if (!trialId || !currentUser) return;

        // Fetch Trial Details and setup WebSocket
        const fetchTrial = async () => {
            try {
                const data = await getMockTrialDetails(trialId);
                setTrial(data);
                setMessages(data.messages || []);
                // Check if trial is already ended
                if (data.status === 'ended' || data.status === 'left') {
                    setTrialEnded(true);
                    // Don't establish WebSocket connection if trial has ended
                    setLoading(false);
                    return;
                }
                
                // Only establish WebSocket connection if trial is active
                const token = localStorage.getItem('token');
                
                if (socketRef.current || isConnecting.current) {
                    console.log(' WebSocket already exists or connecting, skipping');
                    setLoading(false);
                    return;
                }
                
                isConnecting.current = true;

                console.log(' Initiating WebSocket connection...');
                const wsUrl = getWebSocketUrl();
                console.log('   WebSocket URL:', wsUrl);
                const socket = new WebSocket(`${wsUrl}?trialId=${trialId}&token=${token}`);
                
                // Set ref immediately
                socketRef.current = socket;
                console.log(" Socket created, ref set:", !!socketRef.current);

                socket.onopen = () => {
                    socketRef.current = socket;
                    const isRefSet = socketRef.current === socket;
                    console.log(" WebSocket Connected");
                    console.log("   Socket readyState:", socket.readyState);
                    console.log("   Ref set:", isRefSet);
                    console.log("   Ref equals socket:", socketRef.current === socket);
                    setSocketConnected(true);
                    isConnecting.current = false;
                };

                socket.onmessage = (event) => {
                    const receivedData = JSON.parse(event.data);
                    console.log(" Received:", receivedData);
                    
                    if (receivedData.type === 'message') {
                        // Regular message from other user
                        setMessages(prev => [...prev, receivedData.data]);
                    } else if (receivedData.type === 'system') {
                        // System message (user left the trial)
                        const systemMsg: Message = {
                            _id: Date.now().toString(), 
                            text: receivedData.message || receivedData.data?.text, 
                            senderId: 'system',
                            timestamp: new Date().toISOString()
                        };
                        setMessages(prev => [...prev, systemMsg]);
                        
                        // Disable input immediately
                        setTrialEnded(true);
                        setSocketConnected(false);
                        
                        // Close WebSocket connection
                        if (socketRef.current) {
                            socketRef.current.close();
                            socketRef.current = null;
                        }
                        
                        // Redirect to dashboard after a brief delay to show the message
                        setTimeout(() => {
                            navigate('/dashboard/mock-trials');
                        }, 1500);
                    } else if (receivedData.type === 'error') {
                        // Error message (trial ended, etc.)
                        console.warn(' Error from server:', receivedData.message);
                        setTrialEnded(true);
                        setSocketConnected(false);
                        // Close connection and redirect if trial has ended
                        if (socketRef.current) {
                            socketRef.current.close();
                            socketRef.current = null;
                        }
                        setTimeout(() => {
                            navigate('/dashboard/mock-trials');
                        }, 1500);
                    }
                };

                socket.onerror = (error) => {
                    console.error(" WebSocket Error:", error);
                    setSocketConnected(false);
                };

                socket.onclose = (event) => {
                    console.log(" WebSocket Disconnected");
                    console.log("   Close code:", event.code);
                    console.log("   Close reason:", event.reason);
                    setSocketConnected(false);
                    isConnecting.current = false;
                    socketRef.current = null;
                    
                    // If closed due to trial ending, redirect
                    if (event.code === 1008 && (event.reason?.includes('ended') || event.reason?.includes('left'))) {
                        setTrialEnded(true);
                        setTimeout(() => {
                            navigate('/dashboard/mock-trials');
                        }, 1000);
                    }
                };
            } catch (error) {
                console.error("Error fetching trial:", error);
                navigate('/dashboard/mock-trials');
            } finally {
                setLoading(false);
            }
        };
        fetchTrial();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                setSocketConnected(false);
                isConnecting.current = false;
            }
        };

    }, [trialId, currentUser, navigate]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        
        // Don't send if trial has ended
        if (trialEnded) {
            console.warn(' Cannot send: Trial has ended');
            return;
        }
        
        // Don't send empty messages
        if (!newMessage.trim()) {
            return;
        }

        // Check socket connection status
        if (!socketConnected) {
            console.warn(' Cannot send: Socket not connected');
            return;
        }

        // Check socket exists and is open
        if (!socketRef.current) {
            console.warn(' WebSocket ref is null');
            return;
        }

        if (socketRef.current.readyState !== WebSocket.OPEN) {
            console.warn(' WebSocket not open, state:', socketRef.current.readyState);
            setSocketConnected(false);
            return;
        }

        const messageData = {
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        try {
            console.log(' Sending message:', messageData);
            socketRef.current.send(JSON.stringify(messageData));
            setNewMessage('');
        } catch (error) {
            console.error(' Error sending message:', error);
            setSocketConnected(false);
        }
    };
    
    const handleEndOrLeave = async (action: 'end' | 'leave') => {
        if (!trialId) return;
        
        try {
            if (action === 'leave') {
                // Send WebSocket message to notify other users
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    console.log(' Sending leave message via WebSocket');
                    socketRef.current.send(JSON.stringify({
                        type: 'leave',
                        timestamp: new Date().toISOString()
                    }));
                }
                
                // Call API to update trial status
                await leaveTrial(trialId);
            } else {
                await endTrial(trialId);
            }
            
            // Close WebSocket connection
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            
            // Navigate away
            navigate('/dashboard/mock-trials');
        } catch (error) {
            console.error(`Failed to ${action} trial:`, error);
        }
    };

    const handleTimeUp = async () => {
        if (!trialId) return;
        try {
            await analyzeTrial(trialId);
            navigate(`/dashboard/trial-result/${trialId}`);
        } catch (error) {
            console.error("Failed to start analysis:", error);
        }
    };  

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }
    
    if (!trial) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Trial not found</h2>
                    <button 
                        onClick={() => navigate('/dashboard/mock-trials')}
                        className="text-blue-600 hover:underline"
                    >
                        Go back to Mock Trials
                    </button>
                </div>
            </div>
        );
    }

    const plaintiff = trial.plaintiffId;
    const defendant = trial.defendantId;

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
                <button 
                    onClick={() => handleEndOrLeave('leave')} 
                    className="flex items-center gap-2 text-sm text-red-500 font-semibold p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={trialEnded}
                >
                    <LogOut size={16} /> Leave
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        const isSender = msg.senderId === currentUser?._id || msg.senderId?.toString() === currentUser?._id?.toString();
                        return <MessageBubble key={index} message={msg} isSender={isSender} />;
                    })}
                    <div ref={chatEndRef} />
                </div>
            </main>

            <footer className="p-4 bg-white border-t">
                {!socketConnected && !trialEnded && (
                    <div className="mb-2 text-center text-sm text-yellow-600">
                        Connecting...
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="relative">
                    <input 
                        type="text" 
                        placeholder={trialEnded ? "Trial has ended" : socketConnected ? "Type your argument..." : "Connecting..."} 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={trialEnded || !socketConnected}
                        className={`w-full p-3 pr-14 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black ${(trialEnded || !socketConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <button 
                        type="submit" 
                        disabled={trialEnded || !socketConnected || !newMessage.trim()}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default TrialRoomPage;