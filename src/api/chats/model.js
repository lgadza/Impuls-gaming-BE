import { model, Schema } from "mongoose";

const ChatSchema = new Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("chat", ChatSchema);
