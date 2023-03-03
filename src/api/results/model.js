import { model, Schema } from "mongoose";

const ResultsSchema = new Schema(
  {
    sender: { type: String, required: true },
    avatar: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("result", ResultsSchema);
