import { model, Schema } from "mongoose";

const TableStandings = new Schema(
  {
    tournament_name: { type: String, required: true },
    player_name: { type: String, required: true },
    player_avatar: { type: String, required: false },
    league_position: { type: String, required: true },
    overall_league_played: { type: String, required: true },
    overall_league_W: { type: String, required: true },
    overall_league_D: { type: String, required: true },
    overall_league_L: { type: String, required: true },
    overall_league_PTS: { type: String, required: true },
  },
  { timestamps: true }
);

export default TableStandings;
