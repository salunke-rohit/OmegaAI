import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);

// AI Chat API

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to uri");

        // Start server
        app.listen(PORT, () => {
            console.log(`OmegaAI running on port ${PORT}`);
        });

    } catch (err) {
        console.log(err);
    }
};

connectDB();