import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const tournamentSchema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "title is mandatory field and has to be a string",
    },
  },
  year: {
    in: ["body"],
    isString: {
      errorMessage: "year is mandatory field and has to be a string",
    },
  },
  type: {
    in: ["body"],
    isString: {
      errorMessage: "type is mandatory field and has to be a string",
    },
  },
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
