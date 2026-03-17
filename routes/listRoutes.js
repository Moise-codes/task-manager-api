import express from "express";
import { createList, getLists } from "../controllers/listController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createList);
router.get("/:boardId", protect, getLists);

export default router;