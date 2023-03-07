import express from "express";
import createHttpError from "http-errors";
import ReservationsModel from "./model.js";
const reservationRouter = express.Router();
reservationRouter.post("/", async (req, res, next) => {
  try {
    const newReservation = new ReservationsModel(req.body);
    const { _id } = await newReservation.save();
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
reservationRouter.get("/", async (req, res, next) => {
  try {
    const reservations = await ReservationsModel.find({});
    res.send(reservations);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
reservationRouter.get("/:reservationId", async (req, res, next) => {
  try {
    const reservation = await ReservationsModel.findById(
      req.params.reservationId
    );
    if (reservation) {
      res.send(reservation);
    } else {
      next(
        createHttpError(401, `Reservation with id ${reservationId} not found!`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
reservationRouter.put("/:reservationId", async (req, res, next) => {
  try {
    const updatedReservation = await ReservationsModel.findByIdAndUpdate(
      req.params.reservationId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedReservation) {
      res.send(updatedReservation);
    } else {
      next(
        createHttpError(404, `Reservation with id ${reservationId} not found!`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
reservationRouter.delete("/:reservationId", async (req, res, next) => {
  try {
    const deletedReservation = await ReservationsModel.findByIdAndDelete(
      req.params.reservationId
    );
    if (deletedReservation) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, ` Reservation witd id ${reservationId} not found!`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default reservationRouter;
