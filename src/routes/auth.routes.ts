import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { validateRegister, validateLogin } from "../utils/validators";
import { RegisterInput, LoginInput } from "../types/auth.types";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const input: RegisterInput = req.body;
    validateRegister(input);
    const result = await register(input);
    res.status(201).json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const input: LoginInput = req.body;
    validateLogin(input);
    const result = await login(input);
    res.status(200).json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

// Protected endpoint for JWT verification testing
router.get("/me", (req, res, next) => {
  try {
    authenticate(req as any, res, next);
  } catch (err) {
    next(err);
  }
}, (_req, res) => {
  res.json({ success: true, data: { userId: (_req as any).userId } });
});

export default router;
