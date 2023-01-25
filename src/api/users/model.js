import mongoose from "mongoose";

import requestSchema from "../friendRequest/model.js";
const { Schema, model } = mongoose;

export const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    area: { type: String },
    bio: { type: String },
    connections: { pending: [requestSchema], active: [] },
    numberOfTrophies: { type: Number },
    username: { type: String },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model("User", usersSchema);
