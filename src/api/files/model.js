import mongoose from "mongoose";

const { Schema, model } = mongoose;

const projectImagesSchema = new Schema(
  {
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("projectImg", projectImagesSchema);
