import { z } from "zod";

export function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
}

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(3, "Name must be at least 3 characters long"),
  age: z.number().int(),
  height: z.number().int(),
  weight: z.number().int(),
  gender: z.enum(["male", "female", "other"]),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const updateSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().optional(),
  height: z.number().int().optional(),
  weight: z.number().int().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const specializationSchema = z.object({
  specialization: z.string(),
});

export const appointmentSchema = z.object({
  doctorId: z.string(),
  slot: z.string(),
  date: z.string(),
});

export const predictionSchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom must be provided"),
});

export const chatSupportSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});
