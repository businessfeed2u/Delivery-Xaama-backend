const socketio = require("socket.io");
const mongoose = require("mongoose");

require("../models/Socket");
const sockets = mongoose.model("sockets");

let io;

exports.setupWebsocket = (server) => {
  io = socketio(server);

  io.on("connection", async socket => {
    //console.log("socket: ", socket);
    //console.log("=======================================================");
    await sockets.create({ 
      id: socket.id,
    });
    
  });
};


exports.findConnections = () => {
  async function all () {
    return await sockets.find().exec();
  }
  
  return all();
};

exports.sendMessage = (to, message, data) => {
  if(to) {
    to.forEach(connection => {
      io.to(connection.id).emit(message, data);
    });
  } else {
    //
  }
};