import { Schema, model } from "mongoose";

const locationSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Kathmandu"
    isActive: { type: Boolean, default: true }
});

export const Location = model("Location", locationSchema);