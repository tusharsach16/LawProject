import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

async function connectDB() {
  try{
    const url = process.env.MONGODB_URL as string;
    if(!url) throw new Error("MongoDb url not defined in .env");
    await mongoose.connect(url);
    console.log("Connected to DB.");
  } catch(e) {
    console.log("Failed to connect to db");
    console.error(e);
    process.exit(1);
  }
};

export default connectDB;