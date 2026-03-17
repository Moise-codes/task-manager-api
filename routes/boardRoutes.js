import express from "express";
import { createBoard, getBoards } from "../controllers/boardController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createBoard);
router.get("/", protect, getBoards);

export default router;