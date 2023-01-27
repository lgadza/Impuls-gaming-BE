import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import q2m from "query-to-mongo";
import { checkUserSchema, triggerBadRequest } from "./validator.js";

const usersRouter = express.Router();

usersRouter.post(
  "/",
  checkUserSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newUser = new UsersModel(req.body);
      console.log(newUser);

      const duplicate = await UsersModel.findOne({
        email: newUser.email,
      });
      if (duplicate) {
        next(createHttpError(400, "Email already exist"));
      } else {
        const { _id } = await newUser.save();
        res.status(201).send({ _id });
      }
    } catch (error) {
      next(error);
    }
  }
);
usersRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await UsersModel.countDocuments(mongoQuery.criteria);
    const users = await UsersModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    // .populate({
    //   path: "experience",
    // });
    res.send({
      links: mongoQuery.links("https://impulsgaming.cyclic.app/users", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      totalUsers: total,
      users,
    });
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    //   .populate({
    //   path: "experience",
    // });
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});
usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});
usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} is not found`)
      );
    }
  } catch (error) {
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
