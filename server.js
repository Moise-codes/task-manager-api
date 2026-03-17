import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
import connectDB from "./config/db.js";
connectDB();
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Task Manager API running"));

app.listen(5000, () => console.log("Server running on 5000"));