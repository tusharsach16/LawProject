import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required");

export interface CallTokenPayload {
    userId: string;
    appointmentId: string;
    callRoomId: string;
    iat?: number;
    exp?: number;
}

export function verifyCallToken(token: string): CallTokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET as string) as CallTokenPayload;
    } catch {
        return null;
    }
}