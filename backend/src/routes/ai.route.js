import express from "express";
import { analyzeChat } from "../controllers/ai.controller.js";
import { protectRole } from "../middleware/auth.middleware.js";
import { validateAnalyzeChat } from "../middleware/validation.middleware.js";

const router = express.Router();

// Analyze chat conversation (parents only)
router.post("/analyze-chat", protectRole(["parent"]), validateAnalyzeChat, analyzeChat);

export default router;
