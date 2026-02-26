import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Loader2,
    AlertCircle,
    Clock,
    User,
    Users
} from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';
import { generateCallToken, markCallCompleted } from '../services/callService';

const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const RemoteVideo: React.FC<{ peerId: string; stream: MediaStream }> = ({ peerId, stream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-medium text-sm flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>User {peerId.substring(0, 4)}...</span>
                </p>
            </div>
        </div>
    );
};

export const VideoCall: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [callInfo, setCallInfo] = useState<{
        otherPartyName?: string;
        otherPartyRole?: string;
    }>({});

    // signalingUrl is set from the backend-returned value after generateCallToken
    const [signalingUrl, setSignalingUrl] = useState(
        import.meta.env.VITE_SIGNALING_WS_URL as string | undefined
    );

    const {
        status,
        errorMessage,
        isMicEnabled,
        isCameraEnabled,
        callDuration,
        localVideoRef,
        remoteStreams,
        joinCall,
        toggleMic,
        toggleCamera,
        leaveCall,
    } = useWebRTC({
        // Only pass signalingUrl once we have it; hook internally handles reconnect
        signalingUrl: signalingUrl ?? 'wss://your-signaling-server.com',
    });

    useEffect(() => {
        if (!appointmentId) {
            navigate('/dashboard');
            return;
        }

        const initCall = async () => {
            try {
                setLoading(true);
                const response = await generateCallToken(appointmentId);

                setCallInfo({
                    otherPartyName: response.otherPartyName,
                    otherPartyRole: response.otherPartyRole,
                });

                // Use the URL returned by the backend (most authoritative source)
                if (response.signalingUrl) {
                    setSignalingUrl(response.signalingUrl);
                }

                await joinCall(response.token);
            } catch (error: unknown) {
                console.error('Failed to join call:', error);
            } finally {
                setLoading(false);
            }
        };

        initCall();

        // leaveCall is handled internally by useWebRTC's own cleanup effect on unmount.
        // Do NOT call leaveCall here to avoid a double-cleanup.
    }, [appointmentId, navigate]);

    const handleLeaveCall = async () => {
        try {
            await markCallCompleted(appointmentId!, callDuration);
        } catch (error) {
            console.error('Failed to mark call as completed:', error);
        } finally {
            leaveCall();
            navigate('/dashboard/user-appointments');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Joining call...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Call Error</h2>
                    <p className="text-slate-600 mb-6">{errorMessage}</p>
                    <button
                        onClick={() => navigate('/dashboard/appointments')}
                        className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                    >
                        Back to Appointments
                    </button>
                </div>
            </div>
        );
    }

    const remoteStreamsList = Array.from(remoteStreams.entries());
    const hasRemoteParticipants = remoteStreamsList.length > 0;

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-medium">
                            {callInfo.otherPartyName
                                ? `With ${callInfo.otherPartyName}`
                                : hasRemoteParticipants
                                    ? `${remoteStreamsList.length + 1} Participants`
                                    : 'Waiting for others...'}
                        </p>
                        <p className="text-slate-400 text-sm capitalize">
                            {callInfo.otherPartyRole
                                ? callInfo.otherPartyRole
                                : `Session: ${appointmentId?.substring(0, 8)}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {status === 'in-call' && (
                        <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-white font-mono">
                                {formatDuration(callDuration)}
                            </span>
                        </div>
                    )}

                    <div className={`px-4 py-2 rounded-lg font-medium ${status === 'in-call'
                        ? 'bg-green-500/20 text-green-400'
                        : status === 'connecting' || status === 'authenticating' || status === 'acquiring-media'
                            ? 'bg-amber-500/20 text-amber-400'
                            : status === 'waiting'
                                ? 'bg-blue-500/20 text-blue-400'
                                : status === 'reconnecting'
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'bg-slate-700 text-slate-300'
                        }`}>
                        {status === 'in-call' && '● Connected'}
                        {status === 'connecting' && 'Connecting...'}
                        {status === 'authenticating' && 'Authenticating...'}
                        {status === 'acquiring-media' && 'Starting camera...'}
                        {status === 'waiting' && 'Waiting...'}
                        {status === 'reconnecting' && 'Reconnecting...'}
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className={`grid gap-4 h-full content-center ${!hasRemoteParticipants ? 'grid-cols-1 max-w-4xl mx-auto' :
                    remoteStreamsList.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>

                    {/* Local Video */}
                    <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-2xl aspect-video">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                        />
                        {!isCameraEnabled && (
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                <div className="text-center">
                                    <VideoOff className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                                    <p className="text-slate-400">Camera off</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <p className="text-white font-medium">You</p>
                        </div>
                    </div>

                    {/* Remote Videos */}
                    {remoteStreamsList.map(([peerId, stream]) => (
                        <RemoteVideo key={peerId} peerId={peerId} stream={stream} />
                    ))}

                    {/* Waiting placeholder */}
                    {!hasRemoteParticipants && (
                        <div className="flex items-center justify-center bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700 aspect-video">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-300 mb-2">
                                    Waiting for others to join
                                </h3>
                                <p className="text-slate-500 max-w-xs mx-auto">
                                    Share the appointment details with other participants. They'll appear here when they join.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-6 flex items-center justify-center gap-4 z-10">
                <button
                    onClick={toggleMic}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMicEnabled
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                    {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                <button
                    onClick={toggleCamera}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCameraEnabled
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isCameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                <button
                    onClick={handleLeaveCall}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
                    title="End call"
                >
                    <PhoneOff className="w-6 h-6 text-white" />
                </button>
            </div>

            <style>{`
        .mirror { transform: scaleX(-1); }
      `}</style>
        </div>
    );
};

export default VideoCall;