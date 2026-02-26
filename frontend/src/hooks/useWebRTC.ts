import { useCallback, useEffect, useRef, useState } from "react";

export type CallStatus =
    | "idle"
    | "acquiring-media"
    | "authenticating"
    | "waiting"
    | "connecting"
    | "in-call"
    | "reconnecting"
    | "error";

interface ServerMsgError { type: "error"; message: string; code?: string }
interface ServerMsgAuthenticated { type: "authenticated"; userId: string; callRoomId: string }
interface ServerMsgWaiting { type: "waiting_for_peer" }
interface ServerMsgExisting { type: "existing_participants"; participants: string[] }
interface ServerMsgPeerJoined { type: "peer_joined"; otherUserId: string }
interface ServerMsgPeerLeft { type: "peer_disconnected"; userId: string }
interface ServerMsgOffer { type: "offer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
interface ServerMsgAnswer { type: "answer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
interface ServerMsgIce { type: "ice-candidate"; from: string; to: string; candidate: RTCIceCandidateInit }
interface ServerMsgHeartbeatAck { type: "heartbeat_ack"; serverTime: number }
interface ServerMsgRoomFull { type: "room_full"; maxParticipants: number }

type ServerMessage =
    | ServerMsgError | ServerMsgAuthenticated | ServerMsgWaiting
    | ServerMsgExisting | ServerMsgPeerJoined | ServerMsgPeerLeft
    | ServerMsgOffer | ServerMsgAnswer | ServerMsgIce
    | ServerMsgHeartbeatAck | ServerMsgRoomFull;

export interface UseWebRTCProps {
    signalingUrl?: string;
    onCallEnded?: () => void;
}

export interface UseWebRTCReturn {
    status: CallStatus;
    errorMessage: string;
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
    callDuration: number;
    localVideoRef: React.RefObject<HTMLVideoElement>;
    remoteStreams: Map<string, MediaStream>;
    joinCall: (token: string) => Promise<void>;
    toggleMic: () => void;
    toggleCamera: () => void;
    leaveCall: () => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL_MS = 25_000;
const ICE_FETCH_TIMEOUT_MS = 5_000;

export function useWebRTC({
    signalingUrl = "wss://your-signaling-server.com",
    onCallEnded,
}: UseWebRTCProps = {}): UseWebRTCReturn {

    const [status, setStatus] = useState<CallStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

    // ── Refs ────────────────────────────────────────────────────────────────
    const wsRef = useRef<WebSocket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const iceQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const authTokenRef = useRef<string | null>(null);
    const userIdRef = useRef<string | null>(null);
    const callRoomIdRef = useRef<string | null>(null);
    const reconnectCountRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const callStartTimeRef = useRef<number | null>(null);
    const iceServersRef = useRef<RTCIceServer[]>([]);

    // statusRef mirrors `status` state so closures can read current value without stale captures
    const statusRef = useRef<CallStatus>("idle");
    const setStatusSynced = useCallback((s: CallStatus) => {
        statusRef.current = s;
        setStatus(s);
    }, []);

    // connectWebSocketRef allows attemptReconnect to always call the latest connectWebSocket
    const connectWebSocketRef = useRef<(token: string) => void>(() => { });

    // ── ICE Servers ──────────────────────────────────────────────────────────
    const fetchIceServers = useCallback(async (): Promise<RTCIceServer[]> => {
        if (iceServersRef.current.length > 0) return iceServersRef.current;

        try {
            const httpUrl = signalingUrl
                .replace("wss://", "https://")
                .replace("ws://", "http://");

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), ICE_FETCH_TIMEOUT_MS);

            const resp = await fetch(`${httpUrl}/ice`, { signal: controller.signal });
            clearTimeout(timeout);

            if (!resp.ok) throw new Error(`ICE fetch failed: ${resp.status}`);
            const servers = (await resp.json()) as RTCIceServer[];
            iceServersRef.current = servers;
            return servers;
        } catch {
            const fallback: RTCIceServer[] = [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ];
            iceServersRef.current = fallback;
            return fallback;
        }
    }, [signalingUrl]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const setRemoteStream = useCallback((peerId: string, stream: MediaStream | null) => {
        setRemoteStreams((prev) => {
            const next = new Map(prev);
            if (stream) next.set(peerId, stream);
            else next.delete(peerId);
            return next;
        });
    }, []);

    const wsSend = useCallback((msg: object): boolean => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return false;
        try { ws.send(JSON.stringify(msg)); return true; }
        catch { return false; }
    }, []);

    const startDurationTimer = useCallback(() => {
        if (callStartTimeRef.current) return;
        callStartTimeRef.current = Date.now();
        durationTimerRef.current = setInterval(() => {
            if (callStartTimeRef.current) {
                setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
            }
        }, 1000);
    }, []);

    const stopDurationTimer = useCallback(() => {
        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
        }
        callStartTimeRef.current = null;
        setCallDuration(0);
    }, []);

    const startHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) return;
        heartbeatTimerRef.current = setInterval(() => {
            wsSend({ type: "heartbeat" });
        }, HEARTBEAT_INTERVAL_MS);
    }, [wsSend]);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
    }, []);

    // ── Peer Connection ──────────────────────────────────────────────────────
    const getOrCreatePc = useCallback(
        async (peerId: string): Promise<RTCPeerConnection> => {
            const existing = pcsRef.current.get(peerId);
            if (existing && existing.connectionState !== "closed") return existing;

            const iceServers = await fetchIceServers();
            const pc = new RTCPeerConnection({ iceServers });
            pcsRef.current.set(peerId, pc);

            if (!iceQueuesRef.current.has(peerId)) {
                iceQueuesRef.current.set(peerId, []);
            }

            localStreamRef.current?.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
            });

            pc.ontrack = (ev) => {
                const [stream] = ev.streams;
                if (stream) setRemoteStream(peerId, stream);
            };

            pc.onicecandidate = (ev) => {
                if (!ev.candidate) return;
                wsSend({
                    type: "ice-candidate",
                    from: userIdRef.current,
                    to: peerId,
                    candidate: ev.candidate.toJSON(),
                });
            };

            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                if (state === "connected") {
                    startDurationTimer();
                    setStatusSynced("in-call");
                } else if (state === "failed") {
                    pc.restartIce();
                } else if (state === "closed") {
                    setRemoteStream(peerId, null);
                    pcsRef.current.delete(peerId);
                    if (pcsRef.current.size === 0) setStatusSynced("waiting");
                }
            };

            return pc;
        },
        [fetchIceServers, setRemoteStream, startDurationTimer, wsSend, setStatusSynced],
    );

    const drainIceQueue = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
        const queue = iceQueuesRef.current.get(peerId);
        if (!queue?.length) return;
        while (queue.length > 0) {
            const candidate = queue.shift()!;
            try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { }
        }
    }, []);

    const handleOffer = useCallback(
        async (msg: ServerMsgOffer) => {
            try {
                const pc = await getOrCreatePc(msg.from);
                await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                await drainIceQueue(msg.from, pc);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                wsSend({ type: "answer", from: userIdRef.current, to: msg.from, sdp: answer });
                setStatusSynced("in-call");
            } catch { }
        },
        [drainIceQueue, getOrCreatePc, wsSend, setStatusSynced],
    );

    const handleAnswer = useCallback(
        async (msg: ServerMsgAnswer) => {
            try {
                const pc = pcsRef.current.get(msg.from);
                if (!pc) return;
                await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                await drainIceQueue(msg.from, pc);
                setStatusSynced("in-call");
            } catch { }
        },
        [drainIceQueue, setStatusSynced],
    );

    const handleIceCandidate = useCallback(
        async (msg: ServerMsgIce) => {
            const pc = pcsRef.current.get(msg.from);
            if (!pc || !pc.remoteDescription) {
                const queue = iceQueuesRef.current.get(msg.from) ?? [];
                queue.push(msg.candidate);
                iceQueuesRef.current.set(msg.from, queue);
                return;
            }
            try { await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch { }
        },
        [],
    );

    const initiateCallToPeer = useCallback(
        async (peerId: string) => {
            try {
                const pc = await getOrCreatePc(peerId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                wsSend({ type: "offer", from: userIdRef.current, to: peerId, sdp: offer });
            } catch { }
        },
        [getOrCreatePc, wsSend],
    );

    // ── Cleanup ──────────────────────────────────────────────────────────────
    const cleanup = useCallback(() => {
        stopDurationTimer();
        stopHeartbeat();

        pcsRef.current.forEach((pc) => pc.close());
        pcsRef.current.clear();
        iceQueuesRef.current.clear();

        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;

        if (localVideoRef.current) localVideoRef.current.srcObject = null;

        setRemoteStreams(new Map());
    }, [stopDurationTimer, stopHeartbeat]);

    // ── Reconnect ────────────────────────────────────────────────────────────
    // Uses connectWebSocketRef to avoid stale closure – ref is always current
    const attemptReconnect = useCallback(() => {
        if (reconnectCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
            setStatusSynced("error");
            setErrorMessage("Connection lost. Please refresh the page.");
            return;
        }

        reconnectCountRef.current += 1;
        const delay = Math.min(1000 * 2 ** reconnectCountRef.current, 15_000);

        setStatusSynced("reconnecting");

        reconnectTimerRef.current = setTimeout(() => {
            if (authTokenRef.current) {
                // Always calls the latest version of connectWebSocket via ref
                connectWebSocketRef.current(authTokenRef.current);
            }
        }, delay);
    }, [setStatusSynced]);

    // ── WebSocket ────────────────────────────────────────────────────────────
    const connectWebSocket = useCallback(
        (token: string) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) return;

            const ws = new WebSocket(signalingUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatusSynced("authenticating");
                ws.send(JSON.stringify({ type: "authenticate", token }));
                startHeartbeat();
            };

            ws.onclose = (ev) => {
                stopHeartbeat();

                if (ev.code >= 4000) return; // intentional close

                // Read statusRef.current (not closed-over state) to avoid stale value
                const currentStatus = statusRef.current;
                if (
                    currentStatus === "in-call" ||
                    currentStatus === "connecting" ||
                    currentStatus === "waiting" ||
                    currentStatus === "authenticating"
                ) {
                    attemptReconnect();
                }
            };

            ws.onerror = () => { };

            ws.onmessage = async (ev: MessageEvent<string>) => {
                let msg: ServerMessage;
                try { msg = JSON.parse(ev.data) as ServerMessage; }
                catch { return; }

                switch (msg.type) {
                    case "error":
                        setStatusSynced("error");
                        setErrorMessage(msg.message);
                        ws.close();
                        break;

                    case "room_full":
                        setStatusSynced("error");
                        setErrorMessage(`Call is full (max ${msg.maxParticipants} participants)`);
                        ws.close();
                        break;

                    case "authenticated":
                        userIdRef.current = msg.userId;
                        callRoomIdRef.current = msg.callRoomId;
                        reconnectCountRef.current = 0;
                        break;

                    case "waiting_for_peer":
                        setStatusSynced("waiting");
                        break;

                    case "existing_participants":
                        setStatusSynced(msg.participants.length > 0 ? "connecting" : "waiting");
                        await Promise.all(msg.participants.map(initiateCallToPeer));
                        break;

                    case "peer_joined":
                        if (statusRef.current === "waiting") setStatusSynced("connecting");
                        break;

                    case "peer_disconnected": {
                        const { userId } = msg;
                        const pc = pcsRef.current.get(userId);
                        if (pc) { pc.close(); pcsRef.current.delete(userId); }
                        setRemoteStream(userId, null);
                        if (pcsRef.current.size === 0) setStatusSynced("waiting");
                        break;
                    }

                    case "offer": await handleOffer(msg); break;
                    case "answer": await handleAnswer(msg); break;
                    case "ice-candidate": await handleIceCandidate(msg); break;
                    case "heartbeat_ack": break;

                    default: {
                        const _exhaustive: never = msg;
                        void _exhaustive;
                    }
                }
            };
        },
        [
            signalingUrl,
            startHeartbeat,
            stopHeartbeat,
            attemptReconnect,
            initiateCallToPeer,
            handleOffer,
            handleAnswer,
            handleIceCandidate,
            setRemoteStream,
            setStatusSynced,
        ],
    );

    // Keep connectWebSocketRef in sync so attemptReconnect always calls the latest version
    useEffect(() => {
        connectWebSocketRef.current = connectWebSocket;
    }, [connectWebSocket]);

    // ── Public API ───────────────────────────────────────────────────────────
    const joinCall = useCallback(
        async (token: string) => {
            setStatusSynced("acquiring-media");
            setErrorMessage("");
            authTokenRef.current = token;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                    audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48_000 },
                });

                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                connectWebSocket(token);
            } catch (err: unknown) {
                const name = err instanceof Error ? err.name : "UnknownError";
                setStatusSynced("error");
                if (name === "NotAllowedError") {
                    setErrorMessage("Camera/microphone access denied. Please allow and retry.");
                } else if (name === "NotFoundError") {
                    setErrorMessage("No camera or microphone found on this device.");
                } else if (name === "NotReadableError") {
                    setErrorMessage("Camera/mic is in use by another application.");
                } else {
                    setErrorMessage("Failed to access camera/microphone.");
                }
            }
        },
        [connectWebSocket, setStatusSynced],
    );

    const toggleMic = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setIsMicEnabled(track.enabled);
    }, []);

    const toggleCamera = useCallback(() => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setIsCameraEnabled(track.enabled);
    }, []);

    const leaveCall = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        reconnectCountRef.current = 0;
        authTokenRef.current = null;

        const ws = wsRef.current;
        wsRef.current = null;
        ws?.close(1000, "user-left");

        cleanup();
        setStatusSynced("idle");
        setErrorMessage("");

        onCallEnded?.();
    }, [cleanup, onCallEnded, setStatusSynced]);

    // Cleanup on unmount only
    useEffect(() => {
        return () => { leaveCall(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        status,
        errorMessage,
        isMicEnabled,
        isCameraEnabled,
        callDuration,
        localVideoRef: localVideoRef as React.RefObject<HTMLVideoElement>,
        remoteStreams,
        joinCall,
        toggleMic,
        toggleCamera,
        leaveCall,
    };
}