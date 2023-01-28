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
    //   path: "participant",
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
    //   path: "participant",
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

// ********************************** EMBEDDING PARTICIPANTS**************************
tournamentsRouter.post(
  "/:tournamentId/participants",
  async (req, res, next) => {
    try {
      const currentParticipant = req.body;

      if (currentParticipant) {
        const tournamentToInsert = {
          ...req.body,
          participantDate: new Date(),
        };

        const updatedTournament = await TournamentsModel.findByIdAndUpdate(
          req.params.tournamentId,
          { $push: { participants: tournamentToInsert } },
          { new: true, runValidators: true }
        );

        if (updatedTournament) {
          res.send(updatedTournament);
        } else {
          next(
            createHttpError(
              404,
              `Tournament with id ${req.params.tournamentId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Tournament with id ${req.body.tournamentId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

tournamentsRouter.get("/:tournamentId/participants", async (req, res, next) => {
  try {
    const tournament = await TournamentsModel.findById(req.params.tournamentId);
    if (tournament) {
      res.send(tournament.participants);
    } else {
      next(
        createHttpError(
          404,
          `Tournament with id ${req.params.tournamentId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

tournamentsRouter.get(
  "/:tournamentId/participants/:participantId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );
      if (tournament) {
        const currentParticipant = tournament.participants.find(
          (tournament) => tournament._id.toString() === req.params.participantId
        );
        if (currentParticipant) {
          res.send(currentParticipant);
        } else {
          next(
            createHttpError(
              404,
              `Participant with id ${req.params.participantId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Tournament with id ${req.params.tournamentId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

tournamentsRouter.put(
  "/:tournamentId/participants/:participantId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );

      if (tournament) {
        const index = tournament.participants.findIndex(
          (tournament) => tournament._id.toString() === req.params.participantId
        );
        if (index !== -1) {
          tournament.participants[index] = {
            ...tournament.participants[index].toObject(),
            ...req.body,
          };

          await tournament.save();
          res.send(tournament);
        } else {
          next(
            createHttpError(
              404,
              `Participant with id ${req.params.participantId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Tournament with id ${req.params.tournamentId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

tournamentsRouter.delete(
  "/:tournamentId/participants/:participantId",
  async (req, res, next) => {
    try {
      const updatedTournament = await TournamentsModel.findByIdAndUpdate(
        req.params.tournamentId,
        { $pull: { participants: { _id: req.params.participantId } } },
        { new: true }
      );
      if (updatedTournament) {
        res.send(updatedTournament);
      } else {
        next(
          createHttpError(
            404,
            `Tournament with id ${req.params.tournamentId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default tournamentsRouter;
