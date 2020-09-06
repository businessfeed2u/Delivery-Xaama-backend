const socketio = require("socket.io");
const mongoose = require("mongoose");

require("../models/Socket");
const sockets = mongoose.model("sockets");

let io;
//const connections = [];

exports.setupWebsocket = (server) => {
  io = socketio(server);

  io.on("connection", async socket => {
    await sockets.create({ 
      id: socket.id, 
    });
  });
};

exports.findConnections = () => {

  async function all () {
    await sockets.find().then((response) => {
      if(response) {
        console.log("ALL return response: ");
        return response;
      } else {
        console.log("ALL return response null");
        return null;
      }
    }).catch((error) => {
      return error;
    });
  }
  return all();
};

exports.sendMessage = (to, message, data) => {
  console.log("to: ", to);
  if(to) {
    console.log("message if:", to);
    to.forEach(connection => {
      io.to(connection.id).emit(message, data);
    });
  } else {
    console.log("message else: ", to);
  }
};