import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, Scale, Shield, Timer, Loader2 } from 'lucide-react';
import { getMockTrialDetails, endTrial, leaveTrial, analyzeTrial } from '../services/authService';
import { useAppSelector } from '../redux/hooks';
import MessageBubble, { type Message } from '../components/MessageBubble';
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
        <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${minutes < 1 ? 'text-red-500' : 'text-gray-800'}`}>
            <Timer size={16} />
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

        const fetchTrial = async () => {
            try {
                const data = await getMockTrialDetails(trialId);
                setTrial(data);
                setMessages(data.messages || []);

                if (data.status === 'ended' || data.status === 'left') {
                    setTrialEnded(true);
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('token');

                if (socketRef.current || isConnecting.current) {
                    setLoading(false);
                    return;
                }

                isConnecting.current = true;

                const wsUrl = getWebSocketUrl();
                const socket = new WebSocket(`${wsUrl}?trialId=${trialId}&token=${token}`);
                socketRef.current = socket;

                socket.onopen = () => {
                    socketRef.current = socket;
                    setSocketConnected(true);
                    isConnecting.current = false;
                };

                socket.onmessage = (event) => {
                    const receivedData = JSON.parse(event.data);

                    if (receivedData.type === 'message') {
                        setMessages(prev => [...prev, receivedData.data]);
                    } else if (receivedData.type === 'system') {
                        const systemMsg: Message = {
                            _id: Date.now().toString(),
                            text: receivedData.message || receivedData.data?.text,
                            senderId: 'system',
                            timestamp: new Date().toISOString()
                        };
                        setMessages(prev => [...prev, systemMsg]);
                        setTrialEnded(true);
                        setSocketConnected(false);

                        if (socketRef.current) {
                            socketRef.current.close();
                            socketRef.current = null;
                        }

                        setTimeout(() => navigate('/dashboard/mock-trials'), 1500);
                    } else if (receivedData.type === 'error') {
                        setTrialEnded(true);
                        setSocketConnected(false);
                        if (socketRef.current) {
                            socketRef.current.close();
                            socketRef.current = null;
                        }
                        setTimeout(() => navigate('/dashboard/mock-trials'), 1500);
                    }
                };

                socket.onerror = () => setSocketConnected(false);

                socket.onclose = (event) => {
                    setSocketConnected(false);
                    isConnecting.current = false;
                    socketRef.current = null;
                    if (event.code === 1008 && (event.reason?.includes('ended') || event.reason?.includes('left'))) {
                        setTrialEnded(true);
                        setTimeout(() => navigate('/dashboard/mock-trials'), 1000);
                    }
                };
            } catch (error) {
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

    // Auto-scroll to bottom whenever messages change (WhatsApp style)
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (trialEnded || !newMessage.trim() || !socketConnected) return;
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setSocketConnected(false);
            return;
        }

        const messageData = {
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        try {
            socketRef.current.send(JSON.stringify(messageData));
            setNewMessage('');
        } catch {
            setSocketConnected(false);
        }
    };

    const handleEndOrLeave = async (action: 'end' | 'leave') => {
        if (!trialId) return;
        try {
            if (action === 'leave') {
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ type: 'leave', timestamp: new Date().toISOString() }));
                }
                await leaveTrial(trialId);
            } else {
                await endTrial(trialId);
            }
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
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
            console.error('Failed to start analysis:', error);
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
                    <button onClick={() => navigate('/dashboard/mock-trials')} className="text-blue-600 hover:underline">
                        Go back to Mock Trials
                    </button>
                </div>
            </div>
        );
    }

    const plaintiff = trial.plaintiffId;
    const defendant = trial.defendantId;

    return (
        /*
         * KEY LAYOUT:
         * - Outer div: full viewport height, flex column, overflow hidden
         * - header: fixed height, no shrink
         * - main (chat area): flex-1 + overflow-y-auto — this is the ONLY scrollable zone
         * - footer: fixed height, no shrink
         * This ensures messages are always anchored to the bottom (WhatsApp style)
         * and the page itself never scrolls.
         */
        <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
            {/* ── HEADER ── */}
            <header className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-white border-b shadow-sm">
                {/* Plaintiff vs Defendant */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="flex items-center gap-1 text-blue-600 font-semibold text-xs sm:text-sm truncate">
                        <Scale size={16} className="flex-shrink-0" />
                        <span className="truncate max-w-[70px] sm:max-w-none">
                            {plaintiff?.username || plaintiff?.name || 'Plaintiff'}
                        </span>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-gray-500 flex-shrink-0">VS</span>
                    <div className="flex items-center gap-1 text-red-600 font-semibold text-xs sm:text-sm truncate">
                        <Shield size={16} className="flex-shrink-0" />
                        <span className="truncate max-w-[70px] sm:max-w-none">
                            {defendant?.username || defendant?.name || 'Defendant'}
                        </span>
                    </div>
                </div>

                {/* Timer */}
                <div className="flex-shrink-0 mx-2">
                    <CountdownTimer startTime={trial.startedAt} onTimeUp={handleTimeUp} />
                </div>

                {/* Leave button */}
                <button
                    onClick={() => handleEndOrLeave('leave')}
                    className="flex-shrink-0 flex items-center gap-1 text-xs sm:text-sm text-red-500 font-semibold p-1.5 sm:p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={trialEnded}
                >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">Leave</span>
                </button>
            </header>

            {/* ── CHAT AREA (only this scrolls) ── */}
            <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
                {/*
                 * min-h-full + flex column + justify-end:
                 * When there are few messages they stick to the BOTTOM of the container
                 * (exactly like WhatsApp). As messages grow they push upward naturally.
                 */}
                <div className="min-h-full flex flex-col justify-end gap-1.5 sm:gap-2">
                    {messages.map((msg, index) => {
                        const isSender =
                            msg.senderId === currentUser?._id ||
                            msg.senderId?.toString() === currentUser?._id?.toString();
                        return <MessageBubble key={msg._id || index} message={msg} isSender={isSender} />;
                    })}
                    {/* Anchor element — always scroll here */}
                    <div ref={chatEndRef} />
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-white border-t">
                {!socketConnected && !trialEnded && (
                    <div className="mb-1.5 text-center text-xs text-yellow-600 flex items-center justify-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        Connecting…
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder={
                            trialEnded ? 'Trial has ended' :
                                socketConnected ? 'Type your argument…' :
                                    'Connecting…'
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={trialEnded || !socketConnected}
                        className={`flex-1 px-4 py-2.5 text-sm border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black transition-opacity ${trialEnded || !socketConnected ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    />
                    <button
                        type="submit"
                        disabled={trialEnded || !socketConnected || !newMessage.trim()}
                        className="flex-shrink-0 p-2.5 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default TrialRoomPage;