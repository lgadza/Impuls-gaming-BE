import mongoose from "mongoose";
import { Schema } from "mongoose";

const participantModel = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  nickname: { type: String, required: true },
  terms: { type: Boolean, required: true },
  checkedIn: { type: Boolean, default: false },
});

export default participantModel;
