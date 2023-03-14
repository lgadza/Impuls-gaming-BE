import express, { request } from "express";
import httpErrors from "http-errors";
import CommentsModel from "./model.js";
import UsersModel from "../../users/model.js";
// import likeModel from "./likeModel.js";
import createHttpError from "http-errors";
import { JWTAuthMiddleware } from "../../../lib/auth/jwtAuth.js";

const commentsRouter = express.Router();

commentsRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.body.user;
    const user = await UsersModel.findById(userId);
    if (user) {
      const newComment = new CommentsModel({
        ...req.body,
      });
      const { _id } = await newComment.save();
      res.status(201).send(`Comment with id ${_id} created successfully`);
    } else {
      next(createHttpError(`User with id ${userId} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

commentsRouter.get("/", async (req, res, next) => {
  try {
    const comments = await CommentsModel.find()
      .populate("user")
      .populate({ path: "user" });
    res.send(comments);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

commentsRouter.get("/:commentId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const comment = await CommentsModel.findById(commentId)
      .populate({
        path: "user",
      })
      .populate({ path: "user" });
    if (commentId) {
      res.send(comment);
    } else {
      next(createHttpError(`Comment with id ${commentId} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

commentsRouter.put(
  "/:commentId",
  JWTAuthMiddleware,

  async (req, res, next) => {
    try {
      const commentId = req.params.commentId;
      const updatedComment = await CommentsModel.findByIdAndUpdate(
        commentId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      if (updatedComment) {
        res.send(updatedComment);
      } else {
        next(createHttpError(`Comment with id ${commentId} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

commentsRouter.delete(
  "/:commentId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const commentId = req.params.commentId;
      const deletedComment = await CommentsModel.findByIdAndDelete(commentId);
      if (deletedComment) {
        res.status(204).send();
      } else {
        next(createHttpError(`Comment with id ${commentId} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// ***********************LIKES**********************
commentsRouter.put("/:commentId/likes", async (req, res, next) => {
  try {
    const comment = await CommentsModel.findById(req.params.commentId);

    if (comment) {
      const index = comment.likes.findIndex(
        (userId) => userId.userId.toString() === req.body.userId
      );
      if (index !== -1) {
        const comment = await CommentsModel.findByIdAndUpdate(
          req.params.commentId,
          {
            $pull: { likes: { userId: req.body.userId } },
          },
          { new: true, runValidators: true }
        );

        res.send(comment);
      } else {
        const comment = await CommentsModel.findByIdAndUpdate(
          req.params.commentId,
          {
            $push: { likes: { userId: req.body.userId } },
          },
          { new: true, runValidators: true }
        );

        res.send(comment);
      }
    } else {
      next(
        createHttpError(
          404,
          `Comment with id ${req.params.commentId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
export default commentsRouter;
