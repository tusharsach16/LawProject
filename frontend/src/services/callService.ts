import api from "./api";

export interface GenerateCallTokenResponse {
    token: string;
    callRoomId: string;
    signalingUrl: string;
    appointmentTime: string;
    duration: number;
    maxParticipants: number;
    otherPartyName: string;
    otherPartyRole: "lawyer" | "client";
}

export interface VerifyCallAccessResponse {
    allowed: boolean;
    appointmentId: string;
    otherUser: {
        id: string;
        name: string;
        role: "lawyer" | "client";
    };
    participants: Array<{
        id: string;
        name: string;
        role: "lawyer" | "client" | "participant";
    }>;
}

export interface MarkCallCompletedResponse {
    success: boolean;
    msg: string;
}

export const generateCallToken = async (
    appointmentId: string,
): Promise<GenerateCallTokenResponse> => {
    const resp = await api.post<GenerateCallTokenResponse>(
        "/appointments/generate-call-token",
        { appointmentId },
    );
    return resp.data;
};

export const verifyCallAccess = async (
    callRoomId: string,
): Promise<VerifyCallAccessResponse> => {
    const resp = await api.get<VerifyCallAccessResponse>(
        `/appointments/verify-call-access/${callRoomId}`,
    );
    return resp.data;
};

export const markCallCompleted = async (
    appointmentId: string,
    callDuration?: number,
): Promise<MarkCallCompletedResponse> => {
    const resp = await api.post<MarkCallCompletedResponse>(
        "/appointments/mark-call-completed",
        { appointmentId, callDuration },
    );
    return resp.data;
};

export default api;
