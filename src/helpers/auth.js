//  Loading database module
const mongoose = require("mongoose");

//	Loading User schema and Users collection from database
require("../models/User");
const users = mongoose.model("Users");

module.exports = {
	async admin(req, res, next) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send("Invalid id!");
		}

		await users.findById(userId).then((response) => {
			if(response) {
				if(response.userType != 2) {
					return res.status(401).send("User not authorized!");
				}

				return next();
			} else {
				return res.status(404).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	async manager(req, res, next) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send("Invalid id!");
		}

		await users.findById(userId).then((response) => {
			if(response) {
				if(response.userType != 1 && response.userType != 2) {
					return res.status(401).send("User not authorized!");
				}

				return next();
			} else {
				return res.status(404).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};