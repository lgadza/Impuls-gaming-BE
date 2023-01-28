import express from "express";
import createHttpError from "http-errors";
import TournamentsModel from "./model.js";
import q2m from "query-to-mongo";
import { checkTournamentSchema, triggerBadRequest } from "./validator.js";

const tournamentsRouter = express.Router();

tournamentsRouter.post(
  "/",
  checkTournamentSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newTournament = new TournamentsModel(req.body);

      const duplicate = await TournamentsModel.findOne({
        name: newTournament.name,
      });
      console.log(duplicate);
      if (duplicate) {
        res
          .status(400)
          .send({ message: `Tournament name ${req.body.name} already exist` });
        // next(createHttpError(400, "Tournament name already exist"));
      } else {
        const tournament = await newTournament.save();
        res.status(201).send(tournament);
      }
    } catch (error) {
      next(error);
    }
  }
);
tournamentsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await TournamentsModel.countDocuments(mongoQuery.criteria);
    const tournaments = await TournamentsModel.find(
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
      links: mongoQuery.links(
        "https://impulsgaming.cyclic.app/tournaments",
        total
      ),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      totalTournaments: total,
      tournaments,
    });
  } catch (error) {
    next(error);
  }
});
tournamentsRouter.get("/:tournamentId", async (req, res, next) => {
  try {
    const tournament = await TournamentsModel.findById(req.params.tournamentId);
    //   .populate({
    //   path: "experience",
    // });
    if (tournament) {
      res.send(tournament);
    } else {
      next(
        createHttpError(
          404,
          `Tournament with id ${req.params.tournamentId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
tournamentsRouter.put("/:tournamentId", async (req, res, next) => {
  try {
    const updatedTournament = await TournamentsModel.findByIdAndUpdate(
      req.params.tournamentId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedTournament) {
      res.send(updatedTournament);
    } else {
      next(
        createHttpError(
          404,
          `Tournament with id ${req.params.tournamentId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
tournamentsRouter.delete("/:tournamentId", async (req, res, next) => {
  try {
    const deletedTournament = await TournamentsModel.findByIdAndDelete(
      req.params.tournamentId
    );
    if (deletedTournament) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Tournament with id ${req.params.tournamentId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// ********************************** EMBEDDING**************************
// tournamentsRouter.post("/:tournamentId/experiences", async (req, res, next) => {
//   try {
//     const currentExperience = req.body;

//     if (currentExperience) {
//       const tournamentToInsert = {
//         ...req.body,
//         experienceDate: new Date(),
//       };

//       const updatedTournament = await TournamentsModel.findByIdAndUpdate(
//         req.params.tournamentId,
//         { $push: { experiences: tournamentToInsert } },
//         { new: true, runValidators: true }
//       );

//       if (updatedTournament) {
//         res.send(updatedTournament);
//       } else {
//         next(
//           createHttpError(404, `Tournament with id ${req.params.tournamentId} not found!`)
//         );
//       }
//     } else {
//       next(createHttpError(404, `Tournament with id ${req.body.tournamentId} not found!`));
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// tournamentsRouter.get("/:tournamentId/experiences", async (req, res, next) => {
//   try {
//     const tournament = await TournamentsModel.findById(req.params.tournamentId);
//     if (tournament) {
//       res.send(tournament.experiences);
//     } else {
//       next(
//         createHttpError(404, `Tournament with id ${req.params.tournamentId} not found!`)
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// tournamentsRouter.get(
//   "/:tournamentId/experiences/:experienceId",
//   async (req, res, next) => {
//     try {
//       const tournament = await TournamentsModel.findById(req.params.tournamentId);
//       if (tournament) {
//         const currentExperience = tournament.experiences.find(
//           (tournament) => tournament._id.toString() === req.params.experienceId
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
//           createHttpError(404, `Tournament with id ${req.params.tournamentId} not found!`)
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// tournamentsRouter.put(
//   "/:tournamentId/experiences/:experienceId",
//   async (req, res, next) => {
//     try {
//       const tournament = await TournamentsModel.findById(req.params.tournamentId);

//       if (tournament) {
//         const index = tournament.experiences.findIndex(
//           (tournament) => tournament._id.toString() === req.params.experienceId
//         );
//         if (index !== -1) {
//           tournament.experiences[index] = {
//             ...tournament.experiences[index].toObject(),
//             ...req.body,
//           };

//           await tournament.save();
//           res.send(tournament);
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
//           createHttpError(404, `Tournament with id ${req.params.tournamentId} not found!`)
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// tournamentsRouter.delete(
//   "/:tournamentId/experiences/:experienceId",
//   async (req, res, next) => {
//     try {
//       const updatedTournament = await TournamentsModel.findByIdAndUpdate(
//         req.params.tournamentId,
//         { $pull: { experiences: { _id: req.params.experienceId } } },
//         { new: true }
//       );
//       if (updatedTournament) {
//         res.send(updatedTournament);
//       } else {
//         next(
//           createHttpError(404, `Tournament with id ${req.params.tournamentId} not found!`)
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

export default tournamentsRouter;
