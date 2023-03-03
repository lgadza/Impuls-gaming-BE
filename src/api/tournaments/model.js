import mongoose from "mongoose";

const { Schema, model } = mongoose;
import participantModel from "./model/partcipantsModel.js";
import registrationModel from "./model/registrationSettings.js";

export const tournamentsSchema = new Schema(
  {
    name: { type: String, required: true },
    discipline_cover: { type: String, required: true },
    discipline_name: { type: String, required: true },
    tournamentParticipants: [participantModel],
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
    structure: {
      stage_type: { type: String },
      general: {
        number: { type: Number },
        size: { type: Number },
        divisions: { type: Number },
        name: { type: String, default: "name" },
      },
      advanced: {
        groupComp: { type: String },
        pointsAtrribution: {
          win: { isWin: { type: Boolean }, points: { type: Number } },
          draw: { isDraw: { type: Boolean }, points: { type: Number } },
          lost: { isLost: { type: Boolean }, points: { type: Number } },
        },
        matchForfeit: {
          isForfeit: { type: Boolean },
          points: { type: Number },
        },
      },
      tiebreaker: {
        option1: { type: String },
        option2: { type: String },
        option3: { type: String },
      },
      placement: {
        isPlacement: { type: Boolean },
      },
      matchSettings: {
        matchFormat: { type: String },
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
