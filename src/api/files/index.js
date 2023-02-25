import express from "express";
import multer from "multer";
import { extname } from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { saveUsersAvatars } from "../../lib/fs-tools.js";
import UsersModel from "../users/model.js";
import ProjectImgModel from "./model.js";
const filesRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "impulsgaming/img/users",
    },
  }),
  limits: { fileSize: 1024 * 1024 * 2 },
}).single("avatar");

filesRouter.post(
  "/:userId/avatar",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const url = req.file.path;
      console.log(url);
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { avatar: url },
        { new: true, runValidators: true }
      );
      await updatedUser.save();
      if (updatedUser) {
        res.send(updatedUser);
        // res.send("File uploaded");
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// filesRouter.post(
//   "/multiple",
//   multer().array("avatars"),
//   async (req, res, next) => {
//     try {
//       console.log("FILES:", req.files);
//       await Promise.all(
//         req.files.map((file) =>
//           saveUsersAvatars(file.originalname, file.buffer)
//         )
//       );
//       res.send("File uploaded");
//     } catch (error) {
//       next(error);
//     }
//   }
// );
const cloudinaryProjectImgUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "impulsgaming/img/tournaments",
    },
  }),
}).single("avatar");
filesRouter.post(
  "/projects/imgs",
  cloudinaryProjectImgUploader,
  async (req, res, next) => {
    try {
      const url = req.file.path;
      console.log(url);
      const newImg = new ProjectImgModel({ url: url });
      const { _id } = await newImg.save();
      if (_id) {
        res.status(201).send({ _id, message: "File sent" });
      }
    } catch (error) {
      next(error);
    }
  }
);
filesRouter.get(
  "/projects/imgs",

  async (req, res, next) => {
    try {
      const imgs = await ProjectImgModel.find({});
      res.send(imgs);
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;
