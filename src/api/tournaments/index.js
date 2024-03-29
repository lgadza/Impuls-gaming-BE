import express from "express";
import createHttpError from "http-errors";
import TournamentsModel from "./model.js";
import q2m from "query-to-mongo";
import { checkTournamentSchema, triggerBadRequest } from "./validator.js";
import UsersModel from "../users/model.js";
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
          { $push: { tournamentParticipants: tournamentToInsert } },
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
      res.send(tournament.tournamentParticipants);
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
        const currentParticipant = tournament.tournamentParticipants.find(
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
        const index = tournament.tournamentParticipants.findIndex(
          (tournament) => tournament._id.toString() === req.params.participantId
        );
        if (index !== -1) {
          tournament.tournamentParticipants[index] = {
            ...tournament.tournamentParticipants[index].toObject(),
            ...req.body,
          };

          await tournament.save();
          res.send(tournament.tournamentParticipants[index]);
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
        {
          $pull: { tournamentParticipants: { _id: req.params.participantId } },
        },
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
// ********************************** EMBEDDING STRUCTURES**************************
tournamentsRouter.post("/:tournamentId/structures", async (req, res, next) => {
  try {
    const currentStructure = req.body;

    if (currentStructure) {
      const tournamentToInsert = {
        ...req.body,
        structureDate: new Date(),
      };

      const updatedTournament = await TournamentsModel.findByIdAndUpdate(
        req.params.tournamentId,
        { $push: { structures: tournamentToInsert } },
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
});

tournamentsRouter.get("/:tournamentId/structures", async (req, res, next) => {
  try {
    const tournament = await TournamentsModel.findById(req.params.tournamentId);
    if (tournament) {
      res.send(tournament.structures);
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
  "/:tournamentId/structures/:structureId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );
      if (tournament) {
        const currentStructure = tournament.structures.find(
          (tournament) => tournament._id.toString() === req.params.structureId
        );
        if (currentStructure) {
          res.send(currentStructure);
        } else {
          next(
            createHttpError(
              404,
              `Structure with id ${req.params.structureId} not found!`
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
  "/:tournamentId/structures/:structureId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );

      if (tournament) {
        const index = tournament.structures.findIndex(
          (tournament) => tournament._id.toString() === req.params.structureId
        );
        if (index !== -1) {
          tournament.structures[index] = {
            ...tournament.structures[index].toObject(),
            ...req.body,
          };

          await tournament.save();
          res.send(tournament.structures[index]);
        } else {
          next(
            createHttpError(
              404,
              `Structure with id ${req.params.structureId} not found!`
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
  "/:tournamentId/structures/:structureId",
  async (req, res, next) => {
    try {
      const updatedTournament = await TournamentsModel.findByIdAndUpdate(
        req.params.tournamentId,
        {
          $pull: { structures: { _id: req.params.structureId } },
        },
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
// ********************* EMBEDDING RESULTS**************************
tournamentsRouter.post("/:tournamentId/results", async (req, res, next) => {
  try {
    const currentResult = req.body;

    if (currentResult) {
      const tournamentToInsert = {
        ...req.body,
        resultDate: new Date(),
      };

      const updatedTournament = await TournamentsModel.findByIdAndUpdate(
        req.params.tournamentId,
        { $push: { results: tournamentToInsert } },
        { new: true, runValidators: true }
      );

      if (updatedTournament) {
        res.send(updatedTournament.results);
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
});

tournamentsRouter.get("/:tournamentId/results", async (req, res, next) => {
  try {
    const tournament = await TournamentsModel.findById(req.params.tournamentId);
    if (tournament) {
      res.send(tournament.results);
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
  "/:tournamentId/results/:resultId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );
      if (tournament) {
        const currentResult = tournament.results.find(
          (tournament) => tournament._id.toString() === req.params.resultId
        );
        if (currentResult) {
          res.send(currentResult);
        } else {
          next(
            createHttpError(
              404,
              `Result with id ${req.params.resultId} not found!`
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
  "/:tournamentId/results/:resultId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );

      if (tournament) {
        const index = tournament.results.findIndex(
          (tournament) => tournament._id.toString() === req.params.resultId
        );
        if (index !== -1) {
          tournament.results[index] = {
            ...tournament.results[index].toObject(),
            ...req.body,
          };

          await tournament.save();
          res.send(tournament.results[index]);
        } else {
          next(
            createHttpError(
              404,
              `Result with id ${req.params.resultId} not found!`
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
  "/:tournamentId/results/:resultId",
  async (req, res, next) => {
    try {
      const updatedTournament = await TournamentsModel.findByIdAndUpdate(
        req.params.tournamentId,
        {
          $pull: { results: { _id: req.params.resultId } },
        },
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

// ********************* EMBEDDING STANDING TABLE**************************
tournamentsRouter.post(
  "/:tournamentId/tableStandings",
  async (req, res, next) => {
    try {
      const currentTableStanding = req.body;
      console.log(currentTableStanding, "TABKE");
      if (currentTableStanding) {
        const tournamentToInsert = {
          ...req.body,
          tableStandingDate: new Date(),
        };

        const updatedTournament = await TournamentsModel.findByIdAndUpdate(
          req.params.tournamentId,
          { $push: { tableStanding: tournamentToInsert } },
          { new: true, runValidators: true }
        );

        if (updatedTournament) {
          res.send(updatedTournament.tableStanding);
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

tournamentsRouter.get(
  "/:tournamentId/tableStandings",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );
      if (tournament) {
        res.send(tournament.tableStanding);
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

tournamentsRouter.get(
  "/:tournamentId/tableStandings/:tableStandingId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );
      if (tournament) {
        const currentTableStanding = tournament.tableStanding.find(
          (tournament) =>
            tournament._id.toString() === req.params.tableStandingId
        );
        if (currentTableStanding) {
          res.send(currentTableStanding);
        } else {
          next(
            createHttpError(
              404,
              `TableStanding with id ${req.params.tableStandingId} not found!`
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
  "/:tournamentId/tableStandings/:tableStandingId",
  async (req, res, next) => {
    try {
      const tournament = await TournamentsModel.findById(
        req.params.tournamentId
      );

      if (tournament) {
        const index = tournament.tableStanding.findIndex(
          (tournament) =>
            tournament._id.toString() === req.params.tableStandingId
        );
        if (index !== -1) {
          tournament.tableStanding[index] = {
            ...tournament.tableStanding[index].toObject(),
            ...req.body,
          };

          await tournament.save();
          res.send(tournament.tableStanding[index]);
        } else {
          next(
            createHttpError(
              404,
              `TableStanding with id ${req.params.tableStandingId} not found!`
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
  "/:tournamentId/tableStandings/:tableStandingId",
  async (req, res, next) => {
    try {
      const updatedTournament = await TournamentsModel.findByIdAndUpdate(
        req.params.tournamentId,
        {
          $pull: { tableStanding: { _id: req.params.tableStandingId } },
        },
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
