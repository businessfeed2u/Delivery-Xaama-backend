const socketio = require("socket.io");
const mongoose = require("mongoose");
const { response } = require("express");
require("dotenv").config();

require("../models/Socket");
const sockets = mongoose.model("sockets");

let io;

exports.setupWebsocket = (server) => {
	io = socketio(server, {
		cors: {
			origin: process.env.URL,
			methods: ["GET"]
		}
	});

	io.on("connection", async (socket) => {
		await sockets.create({
			id: socket.id
		}).catch((error) => {
			// console.log("Error:");
			// console.error(error);
		});
	});

};

exports.findConnections = () => {
	async function all () {
		return await sockets.find();
	}

	return all();
};

exports.sendMessage = (to, message, data) => {
	if(to) {
		to.forEach((connection) => {
			io.to(connection.id).emit(message, data);
		});
	} else {
		//
	}
};
