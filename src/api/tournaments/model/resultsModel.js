import { model, Schema } from "mongoose";

const ResultsSchema = new Schema(
  {
    match_date: { type: String, required: true },
    tournament_name: { type: String, required: true },
    match_time: { type: String, required: true },
    match_status: {
      type: String,
      enum: ["finished", "pending"],
      default: "pending",
      required: false,
    },
    match_homeplayer_name: { type: String, required: true },
    match_homeplayer_id: { type: String, required: true },
    match_homeplayer_score: { type: Number, required: true },
    match_awayplayer_name: { type: String, required: true },
    match_awayplayer_id: { type: String, required: true },
    match_awayplayer_score: { type: Number, required: true },
    match_round: { type: Number, required: true },
    player_home_avatar: { type: String, required: false },
    player_away_avatar: { type: String, required: false },
    stage_name: { type: String, required: false },
    match_reporter_name: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default ResultsSchema;
