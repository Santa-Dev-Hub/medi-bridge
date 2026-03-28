import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
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

    // If OPENAI_API_KEY is configured, try an ML-based prediction via OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const humanSymptoms = symptoms.map(s => {
          return String(s).replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }).join(', ');

        const prompt = `You are a concise medical triage assistant. Given the symptoms below, produce ONLY valid JSON with these keys:\n- prediction: string (single most likely condition)\n- confidence: number (0.0-1.0) representing estimated probability for the prediction\n- possible: array of {name:string, confidence:number} ordered by confidence (these confidences MUST sum to ~1.0)\n- departments: array of short department names (e.g., "Cardiology", "ENT", "General Medicine")\n\nImportant details and constraints:\n- Allowed conditions (choose from these): Flu, Common Cold, Gastroenteritis, Migraine, COVID-19 (possible), Cardiac issue (seek urgent care), Food Poisoning, Pneumonia, Allergic Reaction, UTI, Sinusitis, Anxiety, Depression.\n- ALWAYS return valid JSON and nothing else, with numeric confidences between 0.0 and 1.0.\n- The values in "possible" should be ordered by confidence and should approximately sum to 1.0 (small rounding differences OK).\n- "confidence" must match the probability assigned to the top "prediction" in "possible".\n- If uncertain, still return a best-guess with low confidence (0.05-0.4) and include other plausible diagnoses with probabilities.\n- Do NOT include any explanatory text or Markdown outside the JSON.\n- Keep responses concise and machine-readable only.\n\nSymptoms: ${humanSymptoms}`;

        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 500,
        });

        const text = completion.choices?.[0]?.message?.content?.trim();
        if (text) {
          try {
            const data = JSON.parse(text);
            return res.status(200).json(data);
          } catch (err) {
            // fall through to rule-based if parsing fails
            console.warn('OpenAI response not valid JSON, falling back to rule-based:', text);
          }
        }
      } catch (err) {
        console.error('OpenAI prediction failed, falling back to rule-based:', err?.message || err);
      }
    }

    // --- Naive Bayes classifier loader/trainer (lightweight) ---
    const loadDataset = () => {
      try {
        const p = path.resolve(process.cwd(), 'medi-bridge-backend', 'data', 'symptom_dataset.json');
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('Could not load dataset, NB disabled', err?.message || err);
        return null;
      }
    };

    const trainNB = (dataset) => {
      const classCounts = {}; // label -> count
      const tokenCounts = {}; // label -> { token: count }
      const vocab = new Set();
      let total = 0;
      dataset.forEach(item => {
        const label = item.label;
        classCounts[label] = (classCounts[label] || 0) + 1;
        total += 1;
        tokenCounts[label] = tokenCounts[label] || {};
        item.symptoms.forEach(s => {
          const t = String(s).toLowerCase().trim();
          vocab.add(t);
          tokenCounts[label][t] = (tokenCounts[label][t] || 0) + 1;
        });
      });
      return { classCounts, tokenCounts, vocab, total };
    };

    const predictNB = (model, inputTokens) => {
      if (!model) return null;
      const { classCounts, tokenCounts, vocab, total } = model;
      const labels = Object.keys(classCounts);
      const V = vocab.size || 1;
      const scores = {};
      labels.forEach(label => {
        // prior
        const prior = Math.log((classCounts[label] + 1) / (total + labels.length));
        let score = prior;
        const tc = tokenCounts[label] || {};
        inputTokens.forEach(t => {
          const count = tc[t] || 0;
          // Laplace smoothing
          const prob = (count + 1) / (Object.values(tc).reduce((a,b)=>a+b,0) + V);
          score += Math.log(prob);
        });
        scores[label] = Math.exp(score); // unnormalized
      });
      // normalize
      const sum = Object.values(scores).reduce((a,b)=>a+b,0) || 1;
      const out = Object.entries(scores).map(([k,v]) => ({ name: k, probability: Math.round((v/sum)*100)/100 }));
      out.sort((a,b)=>b.probability - a.probability);
      return out;
    };

    const dataset = loadDataset();
    const nbModel = dataset ? trainNB(dataset) : null;

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
      'runny nose': 'runny nose',
      'sneezing': 'sneezing',
      'loss of taste': 'loss of taste',
      'loss of smell': 'loss of smell',
      'anosmia': 'loss of smell',
      'fatigue': 'fatigue',
      'dry cough': 'cough',
      'body ache': 'body ache',
      'body_ache': 'body ache',
      'vomiting': 'vomiting',
      'sweating': 'sweating',
      'productive cough': 'productive cough',
      'itchy eyes': 'itchy eyes',
      'itchy_eyes': 'itchy eyes',
      'burning on urination': 'burning on urination',
      'frequent urination': 'frequent urination',
      'lower abdominal pain': 'lower abdominal pain',
      'heartburn': 'heartburn',
      'acid reflux': 'acid reflux',
      'stomach bloating': 'stomach bloating',
      'stomach_bloating': 'stomach bloating',
      'blurred vision': 'blurred vision',
      'dizziness': 'dizziness',
      'tingling': 'tingling',
      'rash': 'rash',
      'itchy skin': 'itchy skin'
    };

    const mapped = symptoms.map(sym => {
      const n = normalize(sym);
      return synonyms[n] || n;
    });
    
      // prepare NB tokens from mapped symptoms
      const nbTokens = mapped.map(s => String(s).toLowerCase().trim());
      const nbResult = predictNB(nbModel, nbTokens);

    const has = (token) => mapped.includes(token);

    const conditions = [];

    // Flu: require fever + respiratory symptom + systemic sign to reduce overmatching
    if (has('fever') && (has('cough') || has('sore throat')) && (has('body ache') || has('fatigue') || has('sweating'))) {
      conditions.push({ name: 'Flu', confidence: 0.65 });
    }
    // Common cold mappings
    if ((has('sneezing') || has('runny nose')) && has('sore throat')) {
      conditions.push({ name: 'Common Cold', confidence: 0.6 });
    }
    // COVID-like mapping (loss of taste/smell + respiratory symptoms)
    if ((has('loss of taste') || has('loss of smell')) && (has('fever') || has('cough') || has('dry cough') || has('fatigue'))) {
      conditions.push({ name: 'COVID-19 (possible)', confidence: 0.85 });
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
      // relaxed heuristic fallback: attempt to match templates and return a best-guess
      const templates = {
        'Flu': ['fever', 'cough', 'body ache', 'fatigue'],
        'Common Cold': ['sneezing', 'runny nose', 'sore throat', 'itchy eyes'],
        'Gastroenteritis': ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'stomach bloating'],
        'Migraine': ['headache', 'sensitivity to light', 'nausea', 'blurred vision', 'dizziness'],
        'COVID-19 (possible)': ['fever', 'dry cough', 'loss of taste', 'loss of smell', 'fatigue'],
        'Cardiac issue (seek urgent care)': ['chest pain', 'shortness of breath', 'sweating'],
        'Food Poisoning': ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
        'Pneumonia': ['fever', 'productive cough', 'shortness of breath', 'chest pain'],
        'Allergic Reaction': ['rash', 'itchy skin', 'itchy eyes', 'sneezing'],
        'UTI': ['burning on urination', 'frequent urination', 'lower abdominal pain', 'fever'],
        'Acid Reflux': ['heartburn', 'acid reflux', 'stomach bloating']
      };

      const scores = [];
      for (const [cond, toks] of Object.entries(templates)) {
        const matchCount = toks.filter(t => mapped.includes(t)).length;
        const tokLen = toks.length || 1;
        const ratio = matchCount / tokLen;
        if (matchCount > 0) {
          // stronger confidence scaling: base + ratio-weighted boost
          const base = cond.startsWith('Cardiac') ? 0.82 : cond === 'COVID-19 (possible)' ? 0.75 : cond === 'Pneumonia' ? 0.7 : cond === 'Flu' ? 0.65 : 0.55;
          const confidence = Math.min(0.98, Math.round((base + ratio * 0.35) * 100) / 100);
          scores.push({ name: cond, confidence, matchCount });
        }
      }

      if (scores.length > 0) {
        scores.sort((a, b) => b.confidence - a.confidence || b.matchCount - a.matchCount);
        return res.status(200).json({ prediction: scores[0].name, confidence: scores[0].confidence, possible: scores });
      }

      // If still no scores, compute similarity (Jaccard) between input symptoms and templates
      const normalizeToken = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/[_-]/g, ' ').trim();
      const inputSet = new Set(mapped.map(normalizeToken));
      const simResults = [];
      for (const [cond, toks] of Object.entries(templates)) {
        const tokSet = new Set(toks.map(normalizeToken));
        const intersection = [...inputSet].filter(x => tokSet.has(x)).length;
        const union = new Set([...inputSet, ...tokSet]).size || 1;
        const jaccard = intersection / union; // 0..1
        // scale jaccard to a confidence in a conservative range
        const confidence = Math.round((Math.max(0.05, jaccard) * 0.7 + 0.1) * 100) / 100; // roughly 0.1-0.8
        simResults.push({ name: cond, confidence, jaccard, matchCount: intersection });
      }
      simResults.sort((a, b) => b.confidence - a.confidence || b.matchCount - a.matchCount);
      // return top 3 possible suggestions
      const possible = simResults.slice(0, 3).map(r => ({ name: r.name, confidence: r.confidence }));
      return res.status(200).json({ prediction: possible[0].name, confidence: possible[0].confidence, possible });
    }

    // If NB model gives a strong prediction, prefer it
    if (nbResult && nbResult.length) {
      const nbTop = nbResult[0];
      if (nbTop.probability >= 0.4) {
        // convert probability (0..1) to confidence with a slight boost
        const conf = Math.min(0.98, Math.round(nbTop.probability * 0.95 * 100) / 100);
        return res.status(200).json({ prediction: nbTop.name, confidence: conf, possible: nbResult.map(r=>({name:r.name,confidence:Math.max(0.05, Math.round(r.probability*0.95*100)/100)})) });
      }
    }

    // sort by confidence (rule-based) and merge NB as secondary suggestions
    conditions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    const possible = [...conditions];
    if (nbResult && nbResult.length) {
      nbResult.forEach(r => {
        if (!possible.find(p => p.name === r.name)) {
          possible.push({ name: r.name, confidence: Math.max(0.15, Math.round(r.probability * 0.85 * 100) / 100) });
        }
      });
    }
    possible.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    const top = possible[0];
    return res.status(200).json({ prediction: top.name, confidence: top.confidence, possible });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Error while predicting disease', error: error.message });
  }
};