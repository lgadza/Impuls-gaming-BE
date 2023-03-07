import express from "express";
import { join } from "path";
import tournamentsRouter from "./api/tournaments/index.js";
import listEndpoints from "express-list-endpoints";
import chatsRouter from "./api/socket io/index.js";
import usersRouter from "./api/users/index.js";
import reservationRouter from "./api/reservations/index.js";
import cors from "cors";
import mongoose from "mongoose";
import googleStrategy from "./lib/auth/google.js";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import createHttpError from "http-errors";
import swagger from "swagger-ui-express";
import yaml from "yamljs";
import { newConnectionHandler } from "./api/socket io/index.js";
import {
  unauthorizedHandler,
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} from "./errorHandler.js";
import filesRouter from "./api/files/index.js";

const expressServer = express();

const port = process.env.PORT || 3001;

const httpServer = createServer(expressServer);
export const io = new Server(httpServer);
io.on("connection", newConnectionHandler);
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
expressServer.use(express.json());
expressServer.use(cors());
expressServer.use(passport.initialize());
expressServer.use(cors(corsOpts));
expressServer.use(express.static(publicFolderPath));
// ************************************ SOCKET.IO ********************************

// ****************************** ENDPOINTS ****************************
expressServer.use("/tournaments", tournamentsRouter);
expressServer.use("/users", usersRouter);
expressServer.use("/files", filesRouter);
expressServer.use("/messages", chatsRouter);
expressServer.use("/reservations", reservationRouter);
// *************************** ERROR HANDLERS **************************
expressServer.use(badRequestHandler);
expressServer.use(notFoundHandler);
expressServer.use(unauthorizedHandler);
expressServer.use(genericErrorHandler);
expressServer.use("/docs", swagger.serve, swagger.setup(yamlFile));

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  httpServer.listen(port, () => {
    console.table(listEndpoints(expressServer));
    console.log(`ExpressServer is running on port ${port}`);
  });
});
