import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Appointment, IAppointment } from "../models/Appointment";
import { User, Iuser } from "../models/User";
import { getRedisClient, isRedisAvailable } from "../utils/redisClient";
import mongoose from "mongoose";

// config
const JWT_SECRET = process.env.JWT_SECRET as string;
const SIGNALING_SERVER_URL =
    process.env.SIGNALING_SERVER_URL ?? "http://localhost:8080";

interface AuthenticatedRequest extends Request {
    user: Iuser;
}

type PopulatedUser = Pick<Iuser, "_id" | "name" | "email">;

type PopulatedAppointment = Omit<
    IAppointment,
    "userId" | "lawyerId" | "participants"
> & {
    userId: PopulatedUser;
    lawyerId: PopulatedUser;
    participants: PopulatedUser[];
};

// cache helper
async function cacheCallData(
    callRoomId: string,
    appointmentId: string,
    userId: string,
    lawyerId: string,
    duration: number,
    authorizedUsers: string[],
    maxParticipants: number
): Promise<void> {
    const payload = {
        appointmentId,
        userId,
        lawyerId,
        duration,
        authorizedUsers,
        maxParticipants,
        createdAt: new Date().toISOString(),
    };

    if (isRedisAvailable()) {
        const redis = getRedisClient();
        await redis.setEx(`call:${callRoomId}`, 86_400, JSON.stringify(payload));
        console.log(`[Call] Cached metadata for room ${callRoomId}`);
        return;
    }

    try {
        const resp = await fetch(`${SIGNALING_SERVER_URL}/cache-call`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callRoomId, ...payload }),
        });

        if (!resp.ok) {
            console.error(`[Call] cache-call returned ${resp.status}`);
        }
    } catch (err) {
        console.error("[Call] Could not cache call data:", err);
    }
}

// generateCallToken
export const generateCallToken = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user._id.toString();
        const appointmentId = (req.body as { appointmentId?: string }).appointmentId;

        if (!appointmentId) {
            res.status(400).json({ msg: "appointmentId is required" });
            return;
        }

        const appointment = await Appointment.findById(appointmentId)
            .populate<{ userId: PopulatedUser }>("userId", "_id name email")
            .populate<{ lawyerId: PopulatedUser }>("lawyerId", "_id name email")
            .populate<{ participants: PopulatedUser[] }>(
                "participants",
                "_id name email"
            );

        if (!appointment) {
            res.status(404).json({ msg: "Appointment not found" });
            return;
        }

        const appt = appointment as unknown as PopulatedAppointment;

        const clientId = appt.userId._id.toString();
        const lawyerId = appt.lawyerId._id.toString();
        const extraUsers = (appt.participants ?? []).map((p) =>
            p._id.toString()
        );

        const allAuthorized = [clientId, lawyerId, ...extraUsers];

        if (!allAuthorized.includes(userId)) {
            res.status(403).json({ msg: "Not authorized" });
            return;
        }

        const isClient = userId === clientId;

        if (appointment.paymentStatus !== "paid") {
            res.status(403).json({ msg: "Payment not completed" });
            return;
        }

        if (appointment.appointmentStatus !== "scheduled") {
            res.status(403).json({ msg: "Appointment not active" });
            return;
        }

        const now = new Date();
        const apptTime = new Date(appointment.appointmentTime);
        const windowOpen = new Date(apptTime.getTime() - 15 * 60_000);
        const windowClose = new Date(apptTime.getTime() + 2 * 60 * 60_000);

        if (now < windowOpen) {
            const minutesUntil = Math.ceil(
                (windowOpen.getTime() - now.getTime()) / 60_000
            );
            res.status(403).json({
                msg: `Call available in ${minutesUntil} minute(s)`,
                availableAt: windowOpen.toISOString(),
            });
            return;
        }

        if (now > windowClose) {
            res.status(403).json({ msg: "Call window expired" });
            return;
        }

        await cacheCallData(
            appointment.callRoomId,
            appointment._id.toString(),
            clientId,
            lawyerId,
            appointment.duration,
            allAuthorized,
            appointment.maxParticipants ?? 2
        );

        const token = jwt.sign(
            {
                userId,
                appointmentId: appointment._id.toString(),
                callRoomId: appointment.callRoomId,
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            token,
            callRoomId: appointment.callRoomId,
            signalingUrl: process.env.SIGNALING_WS_URL,
            appointmentTime: appointment.appointmentTime,
            duration: appointment.duration,
            maxParticipants: appointment.maxParticipants ?? 2,
            otherPartyName: isClient ? appt.lawyerId.name : appt.userId.name,
            otherPartyRole: isClient ? "lawyer" : "client",
        });
    } catch (err) {
        console.error("[generateCallToken]", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// verifyCallAccess
export const verifyCallAccess = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user._id.toString();
        const callRoomId = req.params["callRoomId"];

        if (!callRoomId) {
            res.status(400).json({ msg: "callRoomId required", allowed: false });
            return;
        }

        const appointment = await Appointment.findOne({ callRoomId })
            .populate<{ userId: PopulatedUser }>("userId", "_id name email")
            .populate<{ lawyerId: PopulatedUser }>("lawyerId", "_id name email")
            .populate<{ participants: PopulatedUser[] }>(
                "participants",
                "_id name email"
            );

        if (!appointment) {
            res.status(404).json({ msg: "Call not found", allowed: false });
            return;
        }

        const appt = appointment as unknown as PopulatedAppointment;

        const clientId = appt.userId._id.toString();
        const lawyerId = appt.lawyerId._id.toString();
        const extraIds = (appt.participants ?? []).map((p) =>
            p._id.toString()
        );

        const allUsers = [clientId, lawyerId, ...extraIds];

        if (!allUsers.includes(userId)) {
            res.status(403).json({ msg: "Not authorized", allowed: false });
            return;
        }

        if (
            appointment.paymentStatus !== "paid" ||
            appointment.appointmentStatus !== "scheduled"
        ) {
            res.status(403).json({ msg: "Appointment not active", allowed: false });
            return;
        }

        const isClient = userId === clientId;

        res.status(200).json({
            allowed: true,
            appointmentId: appointment._id,
            otherUser: isClient
                ? { id: appt.lawyerId._id, name: appt.lawyerId.name, role: "lawyer" }
                : { id: appt.userId._id, name: appt.userId.name, role: "client" },
            participants: [
                { id: clientId, name: appt.userId.name, role: "client" },
                { id: lawyerId, name: appt.lawyerId.name, role: "lawyer" },
                ...(appt.participants ?? []).map((p) => ({
                    id: p._id.toString(),
                    name: p.name,
                    role: "participant" as const,
                })),
            ],
        });
    } catch (err) {
        console.error("[verifyCallAccess]", err);
        res.status(500).json({ msg: "Server error", allowed: false });
    }
};

// markCallCompleted
export const markCallCompleted = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user._id.toString();
        const { appointmentId, callDuration } = req.body as {
            appointmentId?: string;
            callDuration?: number;
        };

        if (!appointmentId) {
            res.status(400).json({ msg: "appointmentId is required" });
            return;
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            res.status(404).json({ msg: "Appointment not found" });
            return;
        }

        const clientId = appointment.userId.toString();
        const lawyerId = appointment.lawyerId.toString();
        const extraIds = (appointment.participants ?? []).map((p) => p.toString());

        if (![clientId, lawyerId, ...extraIds].includes(userId)) {
            res.status(403).json({ msg: "Not authorized" });
            return;
        }

        const updates: Partial<IAppointment> = {
            appointmentStatus: "completed",
        };
        if (typeof callDuration === "number" && callDuration > 0) {
            updates.actualCallDuration = callDuration;
        }

        await Appointment.findByIdAndUpdate(appointmentId, { $set: updates });

        res.status(200).json({ success: true, msg: "Call marked as completed" });
    } catch (err) {
        console.error("[markCallCompleted]", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// addParticipant
export const addParticipant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const requestingUserId = (req as AuthenticatedRequest).user._id.toString();
        const { appointmentId, participantId } = req.body as {
            appointmentId?: string;
            participantId?: string;
        };

        if (!appointmentId || !participantId) {
            res.status(400).json({ msg: "appointmentId and participantId are required" });
            return;
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            res.status(404).json({ msg: "Appointment not found" });
            return;
        }

        // Only the lawyer or client can add participants
        const clientId = appointment.userId.toString();
        const lawyerId = appointment.lawyerId.toString();

        if (requestingUserId !== clientId && requestingUserId !== lawyerId) {
            res.status(403).json({ msg: "Only the lawyer or client can add participants" });
            return;
        }

        const currentCount = (appointment.participants ?? []).length + 2; // +2 for client & lawyer
        const max = appointment.maxParticipants ?? 2;

        if (currentCount >= max) {
            res.status(400).json({ msg: `Call is full (max ${max} participants)` });
            return;
        }

        const participantObjId = new mongoose.Types.ObjectId(participantId);

        // Check not already a participant
        const alreadyIn = (appointment.participants ?? []).some((p) =>
            p.toString() === participantId
        );
        if (alreadyIn || participantId === clientId || participantId === lawyerId) {
            res.status(409).json({ msg: "User is already a participant" });
            return;
        }

        // Verify participant user exists
        const targetUser = await User.findById(participantId).select("_id");
        if (!targetUser) {
            res.status(404).json({ msg: "Participant user not found" });
            return;
        }

        await Appointment.findByIdAndUpdate(appointmentId, {
            $addToSet: { participants: participantObjId },
        });

        res.status(200).json({ success: true, msg: "Participant added" });
    } catch (err) {
        console.error("[addParticipant]", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// removeParticipant
export const removeParticipant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const requestingUserId = (req as AuthenticatedRequest).user._id.toString();
        const { appointmentId, participantId } = req.body as {
            appointmentId?: string;
            participantId?: string;
        };

        if (!appointmentId || !participantId) {
            res.status(400).json({ msg: "appointmentId and participantId are required" });
            return;
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            res.status(404).json({ msg: "Appointment not found" });
            return;
        }

        const clientId = appointment.userId.toString();
        const lawyerId = appointment.lawyerId.toString();

        // Allow the requesting user to remove themselves, or lawyer/client to remove anyone
        const isSelf = requestingUserId === participantId;
        const isAuthorized =
            isSelf ||
            requestingUserId === clientId ||
            requestingUserId === lawyerId;

        if (!isAuthorized) {
            res.status(403).json({ msg: "Not authorized to remove this participant" });
            return;
        }

        const participantObjId = new mongoose.Types.ObjectId(participantId);

        await Appointment.findByIdAndUpdate(appointmentId, {
            $pull: { participants: participantObjId },
        });

        res.status(200).json({ success: true, msg: "Participant removed" });
    } catch (err) {
        console.error("[removeParticipant]", err);
        res.status(500).json({ msg: "Server error" });
    }
};
