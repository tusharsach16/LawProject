/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a109ca"
 *         name:
 *           type: string
 *           example: "Rahul"
 *         lastname:
 *           type: string
 *           example: "Sharma"
 *         username:
 *           type: string
 *           example: "rahuls"
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         role:
 *           type: string
 *           enum: [general, lawstudent, lawyer]
 *         bio:
 *           type: string
 *         location:
 *           type: string
 *         profileImageUrl:
 *           type: string
 *         bannerImageUrl:
 *           type: string
 *         friends:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Appointment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         lawyerId:
 *           type: string
 *         userId:
 *           type: string
 *         appointmentTime:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: number
 *         price:
 *           type: number
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         appointmentStatus:
 *           type: string
 *           enum: [scheduled, cancelled, completed]
 *         callRoomId:
 *           type: string
 *         razorpayOrderId:
 *           type: string
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Something went wrong"
 */
export const swaggerSchemas = {}; // Just to keep the file valid TS if needed
