import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/Appointment.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, age, height, weight, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      height,
      weight,
      gender
    });

    res.status(201).json({ message: "Signup successful", user });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error while signing up", error: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Error while signing in", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from middleware
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    res.json({ message: "Profile updated", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// 🩺 Get All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching doctors", error });
  }
};


// Get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.query;
    const doctors = await Doctor.find({ specialization });
    if (!doctors.length)
      return res.status(404).json({ message: "No doctors found for this specialization" });
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

// ⏰ Get Doctor Slots
export const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const dateObj = doctor.availableSlots.find(d => d.date === date);
    if (!dateObj) return res.status(404).json({ message: "No slots found for this date" });

    res.status(200).json({ date: dateObj.date, slots: dateObj.slots });
  } catch (error) {
    res.status(500).json({ message: "Error fetching slots", error: error.message });
  }
};

// 📅 Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, date, slot } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const dateObj = doctor.availableSlots.find(d => d.date === date);
    if (!dateObj || !dateObj.slots.includes(slot))
      return res.status(400).json({ message: "Slot not available" });

    const appointment = await Appointment.create({
      userId,
      doctorId,
      date,
      slot,
      status: "confirmed",
    });

    // remove booked slot
    dateObj.slots = dateObj.slots.filter(s => s !== slot);
    await doctor.save();

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error: error.message });
  }
};

// 📜 Get User Appointments
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

// 🍎 Food Info
export const getFoodInfo = async (req, res) => {
  try {
    const { name } = req.query;
    const food = await Food.findOne({ name: { $regex: new RegExp(name, "i") } });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.status(200).json({ food });
  } catch (error) {
    res.status(500).json({ message: "Error fetching food info", error: error.message });
  }
};

// 💪 Health Score
export const getHealthScore = async (req, res) => {
  try {
    const { age, height, weight } = req.body;
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    const score = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : "Overweight";
    res.status(200).json({ bmi, score });
  } catch (error) {
    res.status(500).json({ message: "Error calculating health score", error: error.message });
  }
};

// 🥗 Dietary Check
export const dietaryCheck = async (req, res) => {
  try {
    const { foodList } = req.body;
    const results = await Promise.all(
      foodList.map(async (foodName) => {
        const food = await Food.findOne({ name: { $regex: new RegExp(foodName, "i") } });
        return food ? { name: food.name, calories: food.calories } : { name: foodName, message: "Not found" };
      })
    );
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: "Error checking dietary info", error: error.message });
  }
};

// 🧠 Fetch User or Doctor Info by ID
export const getUserOrDoctorById = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "user") {
      const user = await User.findById(id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json({ type: "user", data: user });
    }

    if (type === "doctor") {
      const doctor = await Doctor.findById(id);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      return res.status(200).json({ type: "doctor", data: doctor });
    }

    return res.status(400).json({ message: "Invalid type parameter" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching info", error: error.message });
  }
};

// 🧠 Simple disease prediction (rule-based fallback)
export const predictDisease = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!Array.isArray(symptoms) || symptoms.length === 0)
      return res.status(400).json({ message: 'Symptoms are required as a non-empty array' });

    // normalize and map common symptom synonyms
    const normalize = (str) => str.toLowerCase().replace(/[_-]/g, ' ').trim();

    const synonyms = {
      'high fever': 'fever',
      'mild fever': 'fever',
      'fever': 'fever',
      'cough': 'cough',
      'phlegm': 'cough',
      'sore throat': 'sore throat',
      'throat irritation': 'sore throat',
      'headache': 'headache',
      'nausea': 'nausea',
      'sensitivity to light': 'sensitivity to light',
      'sensitivity to light)': 'sensitivity to light',
      'shortness of breath': 'shortness of breath',
      'breathlessness': 'shortness of breath',
      'chest pain': 'chest pain',
      'abdominal pain': 'abdominal pain',
      'diarrhoea': 'diarrhea',
      'diarrhea': 'diarrhea',
    };

    const mapped = symptoms.map(sym => {
      const n = normalize(sym);
      return synonyms[n] || n;
    });

    const has = (token) => mapped.includes(token);

    const conditions = [];

    if (has('fever') && (has('cough') || has('sore throat'))) {
      conditions.push({ name: 'Flu', confidence: 0.8 });
    }
    if (has('headache') && (has('nausea') || has('sensitivity to light'))) {
      conditions.push({ name: 'Migraine', confidence: 0.75 });
    }
    if (has('chest pain') || has('shortness of breath')) {
      conditions.push({ name: 'Cardiac issue (seek urgent care)', confidence: 0.9 });
    }
    if (has('abdominal pain') && has('diarrhea')) {
      conditions.push({ name: 'Gastroenteritis', confidence: 0.7 });
    }

    if (conditions.length === 0) {
      // fallback: return most likely generic condition
      return res.status(200).json({ prediction: 'Inconclusive', possible: [], message: 'No confident match found' });
    }

    // sort by confidence
    conditions.sort((a, b) => b.confidence - a.confidence);
    const top = conditions[0];

    res.status(200).json({ prediction: top.name, confidence: top.confidence, possible: conditions });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Error while predicting disease', error: error.message });
  }
};