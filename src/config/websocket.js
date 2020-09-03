const socketio = require("socket.io");

let io;
const connections = [];

exports.setupWebsocket = (server) => {
  io = socketio(server);

  io.on("connection", socket => {
    connections.push({
      id: socket.id,
    });
  });
};

exports.findConnections = () => {
  return connections;
};

exports.sendMessage = (user, message, data) => {
  user.forEach(connection => {
    io.to(connection.id).emit(message, data);
  });
};