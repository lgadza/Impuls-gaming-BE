import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const tournamentsSchema = new Schema(
  {
    name: { type: String, required: true },
    discipline_cover: { type: String },
    discipline_name: { type: String },
    platform: { type: String, required: true },
    size: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Tournament", tournamentsSchema);
