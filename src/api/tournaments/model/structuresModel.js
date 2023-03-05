import mongoose from "mongoose";
import { Schema } from "mongoose";

const structuresModel = new Schema({
  stage_type: { type: String, required: false },
  general: {
    number: { type: Number, required: false },
    size: { type: Number, required: false },
    divisions: { type: Number },
    name: { type: String, default: "name" },
    participantPerGroup: { type: Number },
    winnersPerGroup: { type: Number, default: 2 },
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
      points: { type: Number, default: -1 },
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
});

export default structuresModel;
