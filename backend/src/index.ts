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

const envPath = path.resolve(__dirname, "../.env");
console.log("🔍 Looking for .env at:", envPath);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // only if you're sending cookies or authorization headers
}));
app.use(bodyParser.json());
app.use(express.json());

console.log("✅ Loaded Mongo URL:", process.env.MONGODB_URL?.slice(0, 25) + "...");

app.use('/api', authRoutes);
app.use('/quiz', quizRoutes);
app.use('/apiFriend', friendRoute);
app.use('/api', profile);
app.use('/api/upload', uploadRoutes);
app.use('/api', lawyerRoutes);
app.use('/api', mockTrialRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server running on PORT: ${PORT}`);
});
