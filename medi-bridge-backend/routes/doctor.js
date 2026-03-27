import express from "express";
import jwt from "jsonwebtoken";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/Appointment.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  setAvailability,
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorsBySpecialization,
  getDoctorSlots, // ✅ Added this import
} from "../controllers/doctorController.js";

const router = express.Router();

// ✅ Middleware to verify doctor token
const verifyDoctorToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctorId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// 🩺 Doctor Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, specialization } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctor = new Doctor({ name, specialization });
    await doctor.save();

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🩺 Doctor Login (basic by name)
router.post("/login", async (req, res) => {
  try {
    const { name } = req.body;
    const doctor = await Doctor.findOne({ name });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      doctor,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 📅 Set Availability
router.post("/set-availability", verifyDoctorToken, setAvailability);

// 📖 Get Doctor Appointments
router.get("/appointments", verifyDoctorToken, getDoctorAppointments);

// ✅ Update Appointment Status (accept/cancel)
router.put("/appointments/:id/status", verifyDoctorToken, updateAppointmentStatus);

// 🔍 Get doctors by specialization
router.get("/getDoctorsBySpecialization", protect, getDoctorsBySpecialization);

// ⏰ Get doctor’s available slots
router.get("/getDoctorSlots/:doctorId", protect, getDoctorSlots);

export default router;
