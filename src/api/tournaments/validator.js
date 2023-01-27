import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const tournamentSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "name is mandatory field and has to be a string",
    },
  },
  platform: {
    in: ["body"],
    isString: {
      errorMessage: "platform is mandatory field and has to be a string",
    },
  },
  // size: {
  //   in: ["body"],
  //   Number: {
  //     errorMessage: "size is mandatory field and has to be a number",
  //   },
  // },
};
export const checkTournamentSchema = checkSchema(tournamentSchema);
export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    next(
      createHttpError(400, "Errors during tournament validation", {
        errorsList: errors.array(),
      })
    );
  } else {
    next();
  }
};
