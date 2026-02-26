import twilio from "twilio";

const FREE_STUN: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
];

export async function getIceServers(): Promise<RTCIceServer[]> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !auth) {
        console.log("[ICE] Twilio credentials not set — using free STUN servers");
        return FREE_STUN;
    }

    try {
        const client = twilio(sid, auth);
        const token = await client.tokens.create();
        return token.iceServers as unknown as RTCIceServer[];
    } catch (err) {
        console.warn("[ICE] Twilio TURN failed, falling back to free STUN:", err);
        return FREE_STUN;
    }
}