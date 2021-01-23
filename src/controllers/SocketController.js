//  Loading database module
const mongoose = require("mongoose");

//	Loading Soket collections from database
require("../models/Socket");
const sockets = mongoose.model("sockets");

module.exports = {
	//	Remove current socket from database
	async delete(req, res) {
		const { socketId } = req.body;

		if(!socketId || !socketId.length ) {
			return res.status(400).send("Invalid id!");
		}

		await sockets.findOne({id: socketId}).then((socket) => {
			if(socket) {
				socket.remove().then((sDeleted) => {
					if(sDeleted){
						return res.status(200).send("The socket has been deleted!");
					} else {
						return res.status(400).send("Socket not found!");
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(404).send("Socket not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Delete all sockets
	async deleteAll(req, res) {
		await sockets.deleteMany().then((response) => {
			if(response.n) {
				return res.status(200).send("All sockets have been deleted!");
			} else {
				return res.status(404).send("Sockets not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};