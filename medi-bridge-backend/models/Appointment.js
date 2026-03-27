import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },
  slot: { type: String, required: true },
  status: { type: String, default: "confirmed" },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;