import express from "express";
import {
  adminSignUp,
  adminSignIn,
  getAdminProfile,
  getAllUsers,
  getAllDoctors,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", adminSignUp);
router.post("/signin", adminSignIn);
router.get("/profile", protect, getAdminProfile);
router.get("/users", protect, getAllUsers);
router.get("/doctors", protect, getAllDoctors);

export default router;
