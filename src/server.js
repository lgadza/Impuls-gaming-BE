import express from "express";
import { join } from "path";
import tournamentsRouter from "./api/tournaments/index.js";
import listEndpoints from "express-list-endpoints";
import usersRouter from "./api/users/index.js";
import cors from "cors";
import mongoose from "mongoose";
import googleStrategy from "./lib/auth/google.js";
import passport from "passport";
// import filesRouter from "./api/files/index.js";
import createHttpError from "http-errors";
import swagger from "swagger-ui-express";
import yaml from "yamljs";
import {
  unauthorizedHandler,
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} from "./api/errorHandler.js";
const server = express();
// const port = 3001;
const port = process.env.PORT || 3001;
passport.use("google", googleStrategy);
const publicFolderPath = join(process.cwd(), "./public");

// ***************************** MIDDLEWARES ***************************
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const yamlFile = yaml.load(join(process.cwd(), "./src/docs/apiDocs.yml"));

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `Origin ${origin} is not in the whitelist!`)
      );
    }
  },
};
server.use(express.json());
server.use(cors());
server.use(passport.initialize());
server.use(cors(corsOpts));
server.use(express.static(publicFolderPath));
// server.use("/medias", filesRouter);
// ****************************** ENDPOINTS ****************************
server.use("/tournaments", tournamentsRouter);
server.use("/users", usersRouter);
// *************************** ERROR HANDLERS **************************
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(genericErrorHandler);
server.use("/docs", swagger.serve, swagger.setup(yamlFile));

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
