import mongoose from "mongoose";
import { Schema } from "mongoose";

const registrationModel = new Schema({
  activation: {
    isRegistration: { type: Boolean, default: false },
    registrationOpeningDate: { type: String, required: true },
    registrationClosingDate: { type: String, required: true },
  },
  options: {
    isRegistrationAutomatically: { type: Boolean },
    isEmailNotificationAutomatically: { type: Boolean },
  },
  customization: {
    validationMessage: { type: String },
    refusalMessage: { type: String },
  },
});

export default registrationModel;
