import Doctor from "../models/doctorModel.js";
import Appointment from "../models/Appointment.js";
import jwt from "jsonwebtoken";

// 🧾 Verify doctor token
const verifyDoctorToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctorId = decoded.id;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// 📅 Set Availability
export const setAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const existing = doctor.availableSlots.find(d => d.date === date);
    if (existing) existing.slots = slots;
    else doctor.availableSlots.push({ date, slots });

    await doctor.save();
    res.status(200).json({ message: "Availability updated", doctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating availability", error: error.message });
  }
};

// 📖 Get Doctor’s Appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.doctorId })
      .populate("userId", "name email")
      .sort({ date: 1 });
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// ✅ Update Appointment Status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctorId: req.doctorId },
      { status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error: error.message });
  }
};


// ✅ Get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.query;
    if (!specialization)
      return res.status(400).json({ message: "Specialization is required" });

    const doctors = await Doctor.find({ specialization });
    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

// ✅ Get a doctor’s available slots
export const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({ availableSlots: doctor.availableSlots });
  } catch (error) {
    res.status(500).json({ message: "Error fetching slots", error: error.message });
  }
};