import mongoose from "mongoose";
import { Schema } from "mongoose";

const participantModel = {
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
};

export default participantModel;
