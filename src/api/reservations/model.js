import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reservationsSchema = new Schema(
  {
    // user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: String, required: true },
    station_No: { type: Number, required: false },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: Number, required: true },
    hours: { type: Number, required: true },
    comment: { type: String, required: false },
  },
  { timestamps: true }
);

export default model("reservation", reservationsSchema);
