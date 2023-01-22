import express from "express";
import createHttpError from "http-errors";
import CustomerModel from "./model.js";
import q2m from "query-to-mongo";

const customerRouter = express.Router();

customerRouter.post("/", async (req, res, next) => {
  try {
    const newCustomer = new CustomerModel(req.body);

    const { _id } = await newCustomer.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

customerRouter.get("/", async (req, res, next) => {
  try {
    // let mongoQuery;
    // if (req.query.limit && req.query.skip && limit < 50) {
    //   mongoQuery = q2m(req.query);
    // } else {
    //   mongoQuery = q2m({ skip: 1, limit: 1 });
    // }
    const mongoQuery = q2m(req.query);
    const { total, customers } = await CustomerModel.findCustomers(mongoQuery);

    res.send({
      links: mongoQuery.links("http://localhost:3001/customers", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      customers,
    });
  } catch (error) {
    next(error);
  }
});

customerRouter.get("/:customerId", async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.params.customerId);
    if (customer) {
      res.send({
        // links: mongoQuery.links("http://localhost:3001/customers", total),
        // totalPages: Math.ceil(total / mongoQuery.options.limit),
        customer,
      });
    } else {
      next(
        createHttpError(
          404,
          `Customer with id ${req.params.customerId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

customerRouter.put("/:customerId", async (req, res, next) => {
  try {
    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      req.params.customerId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedCustomer) {
      res.send(updatedCustomer);
    } else {
      next(
        createHttpError(
          404,
          `Customer with id ${req.params.customerId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

customerRouter.delete("/:customerId", async (req, res, next) => {
  try {
    const deletedCustomer = await CustomerModel.findByIdAndDelete(
      req.params.customerId
    );

    if (deletedCustomer) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Customer with id ${req.params.customerId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
// ********************************** EMBEDDING**************************
customerRouter.post("/:customerId", async (req, res, next) => {
  try {
    const currentReview = req.body;

    if (currentReview) {
      const customerToInsert = {
        ...req.body,
        reviewDate: new Date(),
      };

      const updatedCustomer = await CustomerModel.findByIdAndUpdate(
        req.params.customerId,
        { $push: { reviews: customerToInsert } },
        { new: true, runValidators: true }
      );
      console.log("this is me", updatedCustomer);

      if (updatedCustomer) {
        res.send(updatedCustomer);
      } else {
        next(
          createHttpError(
            404,
            `Customer with id ${req.params.customerId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Customer with id ${req.body.customerId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

customerRouter.get("/:customerId/reviews", async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.params.customerId);
    if (customer) {
      res.send(customer.reviews);
    } else {
      next(
        createHttpError(
          404,
          `Customer with id ${req.params.customerId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

customerRouter.get("/:customerId/reviews/:reviewId", async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.params.customerId);
    if (customer) {
      console.log(customer);
      const currentReview = customer.reviews.find(
        (customer) => customer._id.toString() === req.params.reviewId
      );
      console.log(currentReview);
      if (currentReview) {
        res.send(currentReview);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Customer with id ${req.params.customerId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

customerRouter.put("/:customerId/reviews/:reviewId", async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.params.customerId);

    if (customer) {
      const index = customer.reviews.findIndex(
        (customer) => customer._id.toString() === req.params.reviewId
      );
      if (index !== -1) {
        customer.reviews[index] = {
          ...customer.reviews[index].toObject(),
          ...req.body,
        };

        await customer.save();
        res.send(customer);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Customer with id ${req.params.customerId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

customerRouter.delete(
  "/:customerId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const updatedCustomer = await CustomerModel.findByIdAndUpdate(
        req.params.customerId,
        { $pull: { reviews: { _id: req.params.reviewId } } },
        { new: true }
      );
      if (updatedCustomer) {
        res.send(updatedCustomer);
      } else {
        next(
          createHttpError(
            404,
            `Customer with id ${req.params.customerId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
customerRouter.post("/:customerId/reviews", async (req, res, next) => {
  try {
    const review = req.body;
    const customer = await CustomerModel.findById(req.params.customerId);
    if (!customer)
      return next(
        createHttpError(
          404,
          `Customer with id ${req.params.customerId} not found`
        )
      );
    // const like = await ReviewsModel.findById(reviewId);
    // if (!like)
    //   return next(
    //     createHttpError(404, `Review with id ${reviewId} not found!`)
    //   );
    const isLiked = await LikesModel.findOne({
      customer: req.params.customerId,
      status: "Like",
      "likes.reviewId": reviewId,
    });
    if (isLiked) {
      // const quantity = -1;
      // await LikesModel.findOneAndUpdate(
      //   {
      //     customer: req.params.customerId,
      //     "likes.reviewId": reviewId,
      //   },
      //   { $inc: { "likes.$.quantity": quantity } }
      // );
      const updatedLike = await LikesModel.findOneAndUpdate(
        {
          customer: req.params.customerId,
          "likes.reviewId": reviewId,
        },
        { $pull: { likes: { _id: req.params.reviewId } } },
        { new: true }
      );
      if (updatedLike) {
        res.send(updatedLike);
      } else {
        next(
          createHttpError(
            404,
            `Customer with id ${req.params.customerId} not found!`
          )
        );
      }
    } else {
      const modifiedLike = await LikesModel.findOneAndUpdate(
        {
          customer: req.params.customerId,
          status: "Like",
        },
        {
          $push: { likes: { reviewId: reviewId }, quantity },
        },
        {
          new: true,
          runValidators: true,
          upsert: true,
        }
      );
      res.send(modifiedLike);
    }
  } catch (error) {
    next(error);
  }
});

export default customerRouter;
