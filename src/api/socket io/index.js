import ChatsModel from "./model.js";
import express from "express";
import { io } from "../../server.js";

const chatsRouter = express.Router();

let onlineUsers = [];

export const newConnectionHandler = async (newClient) => {
  console.log("NEW CONNECTION:", newClient.id);
  const messages = await ChatsModel.find().sort("-timestamp").limit(30);

  // Load the most recent messages from the database
  // Send the messages to the client
  newClient.emit("message", messages);
  // newClient.emit("newTournament", newTournament);

  // 2. Listen to an event emitted by the FE called "setUsername", this event is going to contain the username in the payload
  const addNewClient = (username, socketId) => {
    !onlineUsers.some((user) => user.username === username) &&
      onlineUsers.push({ username, socketId });
    console.log(
      "***************************************************************************"
    );
    console.log(onlineUsers);
    console.log(
      "***************************************************************************"
    );
  };
  const removeClient = (socketId) => {
    onlineUsers.filter((user) => user.socketId !== socketId);
  };
  const getOneClient = (username) => {
    return onlineUsers.find((user) => user.user.username === username);
  };
  newClient.on("newUser", (payload) => {
    console.log(payload);
    // 2.1 Whenever we receive the username, we keep track of that together with the socket.id
    // onlineUsers.push({ username: payload.username, socketId: newClient.id });
    addNewClient(payload.username, newClient.id);
    // 2.2 Then we have to send the list of online users to the current user that just logged in
    newClient.emit("loggedIn", onlineUsers);

    // 2.3 We have also to inform everybody (but not the sender) of the new user which just joined
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
  newClient.on("sendNotification", ({ reportData, type }) => {
    console.log(reportData, "REPORT INFO");
    const receiver = getOneClient(reportData.receiverName);
    newClient.to(receiver.socketId).emit("getNotification", { reportData });
  });
  // 3. Listen to "sendMessage" event, this is received when an user sends a new message
  newClient.on("sendMessage", (message) => {
    message = new ChatsModel(message.message);
    message.save();
    // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
    newClient.broadcast.emit("newMessage", message);
    // if (room === "") {
    // newClient.broadcast.emit("newMessage", message);

    // } else {
    //   newClient.to(room).emit("newMessage", message);
    // }
  });

  // 4. Listen to an event called "disconnect", this is NOT a custom event!! This event happens when an user closes browser/tab
  newClient.on("disconnect", () => {
    // onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    removeClient(newClient.id);
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
chatsRouter.post("/", async (req, res, next) => {
  const content = req.body;
  console.log(content);
  // Save the message to the database
  const message = new ChatsModel(content);
  await message.save();

  // Emit the message event to all connected clients
  io.emit("message", [message]);

  res.json({ message: "Message sent" });
});
export default chatsRouter;
