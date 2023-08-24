import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const userSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "Name is mandatory field and needs to be a string!",
    },
  },
  surname: {
    in: ["body"],
    isString: {
      errorMessage: "Surname is mandatory field and needs to be a string!",
    },
  },
  email: {
    in: ["body"],
    isString: {
      errorMessage: "Email is mandatory field and needs to be a string!",
    },
  },
  password: {
    in: ["body"],
    isString: {
      errorMessage: "Password is mandatory field !",
    },
  },
};

export const checkUserSchema = checkSchema(userSchema);
export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    next(
      createHttpError(400, "Errors during user validation", {
        errorsList: errors.array(),
      })
    );
  } else {
    next();
  }
};
