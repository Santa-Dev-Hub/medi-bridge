import { z } from "zod";
import { appointmentSchema, specializationSchema } from "../utils/userType.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// 🩺 1. Initiate phone booking
export const initiatePhoneBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: `Hello ${user.name}, please select your specialization.`,
      next: "/handle-specialization-choice"
    });
  } catch (error) {
    res.status(500).json({ message: "Error initiating booking", error: error.message });
  }
};

// 💡 2. Handle specialization choice
export const handleSpecializationChoice = async (req, res) => {
  try {
    const parsed = specializationSchema.parse(req.body);
    const { specialization } = parsed;

    const doctors = await Doctor.find({ specialization });
    if (!doctors.length)
      return res.status(404).json({ message: "No doctors found for this specialization." });

    return res.status(200).json({
      message: `We found ${doctors.length} doctor(s) for ${specialization}. Please choose a doctor.`,
      doctors,
      next: "/handle-doctor-choice"
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid input", error: error.message });
  }
};

// 👨‍⚕️ 3. Handle doctor choice
export const handleDoctorChoice = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    return res.status(200).json({
      message: `Doctor ${doctor.name} selected. Please choose a date for your appointment.`,
      next: "/handle-date-choice"
    });
  } catch (error) {
    res.status(500).json({ message: "Error selecting doctor", error: error.message });
  }
};

// 📅 4. Handle date choice
export const handleDateChoice = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Find the availability object that matches the given date
    const availability = doctor.availableSlots.find(slot => slot.date === date);

    if (!availability) {
      return res.status(404).json({ message: "No slots available for the selected date" });
    }

    return res.status(200).json({
      message: `Available slots for ${date}`,
      slots: availability.slots,
      next: "/handle-slot-choice"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available slots",
      error: error.message
    });
  }
};

// ⏰ 5. Handle slot choice
export const handleSlotChoice = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Find the correct date in availableSlots array
    const selectedDate = doctor.availableSlots.find(
      (entry) => entry.date === date
    );

    if (!selectedDate)
      return res.status(400).json({ message: "No slots found for this date" });

    // Check if slot exists for that date
    const isSlotAvailable = selectedDate.slots.includes(slot);

    if (!isSlotAvailable)
      return res.status(400).json({ message: "Selected slot not available" });

    // If slot is valid
    return res.status(200).json({
      message: `Slot ${slot} selected for ${date}. Please confirm your appointment.`,
      next: "/confirm-appointment",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error choosing slot", error: error.message });
  }
};

// ✅ 6. Confirm appointment
export const confirmAppointment = async (req, res) => {
  try {
    const parsed = appointmentSchema.parse(req.body);
    const { doctorId, date, slot } = parsed;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = await Appointment.create({
      userId: req.user.id,
      doctorId: doctorId,
      date,
      slot,
      status: "confirmed",
    });

    // remove booked slot from doctor
    if (doctor.availableSlots && doctor.availableSlots[date]){
    doctor.availableSlots[date] = doctor.availableSlots[date].filter(s => s !== slot);
    await doctor.save();
    }

    return res.status(201).json({
      message: "Appointment confirmed successfully!",
      appointment
    });
  } catch (error) {
    res.status(400).json({ message: "Error confirming appointment", error: error.message });
  }
};

// 📅 Book an Appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;
    const userId = req.user.id;

    if (!doctorId || !date || !slot)
      return res.status(400).json({ message: "Doctor, date, and slot are required" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Check slot availability
    const dateSlot = doctor.availableSlots.find((d) => d.date === date);
    if (!dateSlot || !dateSlot.slots.includes(slot)) {
      return res.status(400).json({ message: "Slot not available" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId,
      doctorId,
      date,
      slot,
    });

    // Remove booked slot from availability
    dateSlot.slots = dateSlot.slots.filter((s) => s !== slot);
    await doctor.save();

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error: error.message });
  }
};

// 📋 Get User’s Appointments
export const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "name specialization")
      .sort({ date: 1 });
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};