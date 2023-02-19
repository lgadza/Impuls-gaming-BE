import { model, Schema } from "mongoose";

const NotificationsSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    urgency: { type: String, enum: ["low", "critical"] },
  },
  {
    timestamps: true,
  }
);
export default model("notification", NotificationsSchema);
