const FREE_STUN_SERVERS: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
];

export async function getIceServers(): Promise<RTCIceServer[]> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !authToken) {
        console.warn(
            "[ICE] Twilio credentials missing – using free STUN only. " +
            "Calls behind symmetric NAT will fail."
        );
        return FREE_STUN_SERVERS;
    }

    try {
        const twilio = await import("twilio");
        const client = twilio.default(sid, authToken);
        const token = await client.tokens.create();
        return token.iceServers as unknown as RTCIceServer[];
    } catch (err) {
        console.error("[ICE] Twilio token fetch failed, falling back to STUN:", err);
        return FREE_STUN_SERVERS;
    }
}