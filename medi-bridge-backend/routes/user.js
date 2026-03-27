import express from "express";
import { signUp, signIn, updateProfile, getAllDoctors, getDoctorsBySpecialization, getDoctorSlots } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { 
  initiatePhoneBooking,
  handleSpecializationChoice,
  handleDoctorChoice,
  handleDateChoice,
  handleSlotChoice,
  confirmAppointment ,
  bookAppointment,
  getAppointments,
} from "../controllers/appointmentController.js";
import { getUserOrDoctorById } from "../controllers/userController.js";


const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.put("/update", protect, updateProfile);
router.get("/getAllDoctors", protect, getAllDoctors);

// ADD THESE TWO LINES
router.get("/getDoctorsBySpecialization", protect, getDoctorsBySpecialization);
router.get("/getDoctorSlots", protect, getDoctorSlots);

// Appointment routes
router.post("/initiate-phone-booking", protect, initiatePhoneBooking);
router.post("/handle-specialization-choice", protect, handleSpecializationChoice);
router.post("/handle-doctor-choice", protect, handleDoctorChoice);
router.post("/handle-date-choice", protect, handleDateChoice);
router.post("/handle-slot-choice", protect, handleSlotChoice);
router.post("/confirm-appointment", protect, confirmAppointment);
router.post("/bookAppointment", protect, bookAppointment);
router.get("/getAppointments", protect, getAppointments);
router.get("/info/:type/:id", protect, getUserOrDoctorById);


export default router;

