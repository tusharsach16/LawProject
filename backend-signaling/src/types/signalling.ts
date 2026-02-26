export type AuthenticateMessage = {
    type: "authenticate";
    token: string;
};

export type OfferMessage = {
    type: "offer";
    from: string;
    to: string;
    sdp: RTCSessionDescriptionInit;
};

export type AnswerMessage = {
    type: "answer";
    from: string;
    to: string;
    sdp: RTCSessionDescriptionInit;
};

export type IceCandidateMessage = {
    type: "ice-candidate";
    from: string;
    to: string;
    candidate: RTCIceCandidateInit;
};

export type HeartbeatMessage = {
    type: "heartbeat";
};

export type ClientMessage =
    | AuthenticateMessage
    | OfferMessage
    | AnswerMessage
    | IceCandidateMessage
    | HeartbeatMessage;

export type ErrorMessage = {
    type: "error";
    code: SignalingErrorCode;
    message: string;
};

export type AuthenticatedMessage = {
    type: "authenticated";
    userId: string;
    callRoomId: string;
};

export type WaitingForPeerMessage = {
    type: "waiting_for_peer";
};

export type ExistingParticipantsMessage = {
    type: "existing_participants";
    participants: string[];
};

export type PeerJoinedMessage = {
    type: "peer_joined";
    otherUserId: string;
};

export type PeerDisconnectedMessage = {
    type: "peer_disconnected";
    userId: string;
};

export type HeartbeatAckMessage = {
    type: "heartbeat_ack";
    serverTime: number;
};

export type RoomClosedMessage = {
    type: "room_closed";
    reason: string;
};

export type ServerMessage =
    | ErrorMessage
    | AuthenticatedMessage
    | WaitingForPeerMessage
    | ExistingParticipantsMessage
    | PeerJoinedMessage
    | PeerDisconnectedMessage
    | HeartbeatAckMessage
    | RoomClosedMessage
    | OfferMessage
    | AnswerMessage
    | IceCandidateMessage;

export type RedisEnvelope = {
    targetUserId: string;
    payload: ServerMessage;
    excludeUserId?: string;
};

export type CallCacheData = {
    appointmentId: string;
    userId: string;
    lawyerId: string;
    duration: number;
    authorizedUsers: string[];
    maxParticipants: number;
    createdAt: string;
};

export type SignalingErrorCode =
    | "INVALID_TOKEN"
    | "UNAUTHORIZED"
    | "APPOINTMENT_NOT_PAID"
    | "APPOINTMENT_NOT_ACTIVE"
    | "CALL_WINDOW_EXPIRED"
    | "CALL_NOT_FOUND"
    | "INTERNAL_ERROR";