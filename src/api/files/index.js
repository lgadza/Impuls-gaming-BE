import express from "express";
import multer from "multer";
import { extname } from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { saveUsersAvatars } from "../../lib/fs-tools.js";
import UsersModel from "../users/model.js";
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
    // "avatar" needs to match exactly to the name of the field appended in the FormData object coming from the FE
    // If they do not match, multer will not find the file
    try {
      /* const originalFileExtension = extname(req.file.originalname)
    const fileName = req.params.userId + originalFileExtension
    await saveUsersAvatars(fileName, req.file.buffer)
    const url = `http://localhost:3001/img/users/${fileName}`
 */

      console.log(req.file);
      const url = req.file.path;
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send("File uploaded");
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }

      // In FE <img src="http://localhost:3001/img/users/magic.gif" />
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post(
  "/multiple",
  multer().array("avatars"),
  async (req, res, next) => {
    try {
      console.log("FILES:", req.files);
      await Promise.all(
        req.files.map((file) =>
          saveUsersAvatars(file.originalname, file.buffer)
        )
      );
      res.send("File uploaded");
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;
