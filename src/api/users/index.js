import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { checkUserSchema, triggerBadRequest } from "./validator.js";
import { adminOnlyMiddleware } from "../../lib/auth/adminOnly.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { createAccessToken } from "../../lib/auth/tools.js";
import UsersModel from "./model.js";
import passport from "passport";
import { sendRegistrationEmail } from "../../lib/email-tools.js";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_KEY);
const usersRouter = express.Router();

usersRouter.post(
  "/register",
  checkUserSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await UsersModel.findOne({ email });
      if (user) {
        return res.send({
          message: " This email has been already registered, Please login",
        });
      } else {
        const newUser = new UsersModel(req.body);
        await sendRegistrationEmail(email, req.body);
        const { _id } = await newUser.save();
        res.status(201).send({
          _id,
          message: "  We've sent a verification link on your email address",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

usersRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const users = await UsersModel.find({});
      res.send(users);
    } catch (error) {
      next(error);
    }
  }
);
usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  async (req, res, next) => {
    console.log(req.user);
    // res.send({ accessToken: req.user.accessToken });
    res.redirect(
      `${process.env.FE_PROD_URL}/user-page?accessToken=${req.user.accessToken}`
    );
  }
);
usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await UsersModel.findByIdAndUpdate(req.user._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    res.send(user);
  } catch (error) {
    next(error);
  }
});
usersRouter.put(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain the credentials from req.body
    const { email, password } = req.body;

    // 2. Verify the credentials
    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      // 3.1 If credentials are fine --> generate an access token (JWT) and send it back as a response
      const payload = { _id: user._id, role: user.role };

      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      // 3.2 If credentials are NOT fine --> trigger a 401 error
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// ********************************** EMBEDDING**************************
// usersRouter.post("/:userId/experiences", async (req, res, next) => {
//   try {
//     const currentExperience = req.body;

//     if (currentExperience) {
//       const userToInsert = {
//         ...req.body,
//         experienceDate: new Date(),
//       };

//       const updatedUser = await UsersModel.findByIdAndUpdate(
//         req.params.userId,
//         { $push: { experiences: userToInsert } },
//         { new: true, runValidators: true }
//       );

//       if (updatedUser) {
//         res.send(updatedUser);
//       } else {
//         next(
//           createHttpError(404, `User with id ${req.params.userId} not found!`)
//         );
//       }
//     } else {
//       next(createHttpError(404, `User with id ${req.body.userId} not found!`));
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// usersRouter.get("/:userId/experiences", async (req, res, next) => {
//   try {
//     const user = await UsersModel.findById(req.params.userId);
//     if (user) {
//       res.send(user.experiences);
//     } else {
//       next(
//         createHttpError(404, `User with id ${req.params.userId} not found!`)
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// usersRouter.get(
//   "/:userId/experiences/:experienceId",
//   async (req, res, next) => {
//     try {
//       const user = await UsersModel.findById(req.params.userId);
//       if (user) {
//         const currentExperience = user.experiences.find(
//           (user) => user._id.toString() === req.params.experienceId
//         );
//         if (currentExperience) {
//           res.send(currentExperience);
//         } else {
//           next(
//             createHttpError(
//               404,
//               `Experience with id ${req.params.experienceId} not found!`
//             )
//           );
//         }
//       } else {
//         next(
//           createHttpError(404, `User with id ${req.params.userId} not found!`)
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// usersRouter.put(
//   "/:userId/experiences/:experienceId",
//   async (req, res, next) => {
//     try {
//       const user = await UsersModel.findById(req.params.userId);

//       if (user) {
//         const index = user.experiences.findIndex(
//           (user) => user._id.toString() === req.params.experienceId
//         );
//         if (index !== -1) {
//           user.experiences[index] = {
//             ...user.experiences[index].toObject(),
//             ...req.body,
//           };

//           await user.save();
//           res.send(user);
//         } else {
//           next(
//             createHttpError(
//               404,
//               `Experience with id ${req.params.experienceId} not found!`
//             )
//           );
//         }
//       } else {
//         next(
//           createHttpError(404, `User with id ${req.params.userId} not found!`)
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// usersRouter.delete(
//   "/:userId/experiences/:experienceId",
//   async (req, res, next) => {
//     try {
//       const updatedUser = await UsersModel.findByIdAndUpdate(
//         req.params.userId,
//         { $pull: { experiences: { _id: req.params.experienceId } } },
//         { new: true }
//       );
//       if (updatedUser) {
//         res.send(updatedUser);
//       } else {
//         next(
//           createHttpError(404, `User with id ${req.params.userId} not found!`)
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

export default usersRouter;
