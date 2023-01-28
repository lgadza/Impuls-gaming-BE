import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const tournamentsSchema = new Schema(
  {
    name: { type: String, required: true },
    discipline_cover: { type: String },
    discipline_name: { type: String },
    registration: {
      activation: {
        isRegistration: { type: Boolean },
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
      general: {
        number: { type: Number },
        size: { type: Number },
        numberOfDivisions: { type: Number },
        name: { type: String },
      },
      advanced: {
        groupComposition: { type: String },
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
        option: { type: String },
      },
    },
    participants: {
      isCheck_in: { type: Boolean },
      checkInOpeningDate: { type: String },
      checkInClosingDate: { type: String },
    },
    discipline_name: { type: String },
    discipline_name: { type: String },
    discipline_name: { type: String },
    platform: { type: String, required: true },
    size: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Tournament", tournamentsSchema);
