import Admin from "../models/adminModel.js";
import User from "../models/User.js";
import Doctor from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const adminSignUp = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, name, password: hashedPassword });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Sign up successful", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Sign in successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error while signing in" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    console.log("🔹 Incoming request to /admin/profile");
    console.log("🔹 Decoded user from token:", req.user);

    const admin = await Admin.findById(req.user.id);
    console.log("🔹 Admin found:", admin);

    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(404).json({ message: "Admin not found" });
    }

    const userCount = await User.countDocuments();
    const doctorCount = await Doctor.countDocuments();

    console.log("✅ Counts fetched:", { userCount, doctorCount });

    return res.status(200).json({
      message: "Welcome to the Admin Dashboard",
      admin: {
        email: admin.email,
        name: admin.name,
        totalUsers: userCount,
        totalDoctors: doctorCount,
      },
    });
  } catch (error) {
    console.error("🔥 Internal error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
