//  Loading database module
const mongoose = require("mongoose");

//	Loading Soket collections from database
require("../models/Socket");
const socketData = mongoose.model("sockets");

module.exports = {
	//	Delete all sockets
	async delete(req, res) {
		await socketData.deleteMany().then((response) => {
			if(response.n) {
				return res.status(200).send("All sockets have been deleted!");
			} else {
				return res.status(400).send("Sockets not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	
};