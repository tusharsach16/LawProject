import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './config/db';
import path from 'path';
import authRoutes from './routes/authRoutes';
import quizRoutes from './routes/QuizRoutes';
import friendRoute from './routes/FriendRequest';
import profile from './routes/profileRoutes';
import uploadRoutes from './routes/uploadRoutes'; 
import lawyerRoutes from './routes/lawyerRoutes';
import mockTrialRoutes from './routes/mockTrialRoutes';
import http from 'http';
import { initWebSocketServer } from './webSockets';
import './models/User';
import './models/FriendReq/FriendRequest';
import './models/quiz/Category';
import './models/Mocktrial/MockSituation';
import './models/Mocktrial/Mock';
import chatbotRoutes from './routes/chatbotRoutes';

const envPath = path.resolve(__dirname, "../.env");
console.log("🔍 Looking for .env at:", envPath);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://nyaysetu-psi.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.json());

const server = http.createServer(app);
initWebSocketServer(server);

console.log("✅ Loaded Mongo URL:", process.env.MONGODB_URL?.slice(0, 25) + "...");


app.use('/api', authRoutes);
app.use('/api', quizRoutes);
app.use('/apiFriend', friendRoute);
app.use('/api', profile);
app.use('/api/upload', uploadRoutes);
app.use('/api', lawyerRoutes);
app.use('/api', mockTrialRoutes);
app.use('/api', chatbotRoutes);

const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} and WebSocket is ready.`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
