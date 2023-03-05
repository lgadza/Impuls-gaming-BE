import mongoose from "mongoose";

const { Schema, model } = mongoose;
import participantModel from "./model/partcipantsModel.js";
import registrationModel from "./model/registrationSettings.js";
import structuresModel from "./model/structuresModel.js";

export const tournamentsSchema = new Schema(
  {
    name: { type: String, required: true },
    discipline_cover: { type: String, required: true },
    discipline_name: { type: String, required: true },
    tournamentParticipants: [participantModel],
    structures: [structuresModel],
    location: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    registration: {
      activation: {
        isRegistration: { type: Boolean, default: false },
        registrationOpeningDate: { type: String },
        registrationClosingDate: { type: String },
      },
      options: {
        isRegistrationAutomatically: { type: Boolean },
        isEmailNotificationAutomatically: { type: Boolean },
      },
      customization: {
        validationMessage: { type: String },
        refusalMessage: { type: String },
      },
    },
    participants: {
      isCheck_in: { type: Boolean, default: false },
      checkInOpeningDate: { type: String },
      checkInClosingDate: { type: String },
    },
    rules: { type: String, default: "Rules not available" },
    description: { type: String, default: "No description" },
    price: { type: String, default: "No prizes available yet" },
    platform: { type: String, required: true },
    size: { type: Number, required: true },
  },

  {
    timestamps: true,
  }
);

export default model("Tournament", tournamentsSchema);
