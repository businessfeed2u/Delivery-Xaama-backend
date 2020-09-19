//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading Users collection from database
require("../models/User");
const users = mongoose.model("Users");

// Loading helpers
const regEx = require("../helpers/regEx");

//	Exporting Session features
module.exports = {
	//	Return user info from current session
	async index(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send("Invalid id!");
		}

		await users.findById(userId).then((user) => {
			if(user) {
				return res.status(200).json(user);
			} else {
				return res.status(404).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new session from user info
	async create(req, res) {
		const { email, password } = req.body;
		var errors = [];

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push("email");
		}

		if(!password || !password.length) {
			errors.push("password");
		}

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await users.findOne({ email: email.trim().toLowerCase() }).then((user) => {
			if(user) {
				bcrypt.compare(password, user.password).then((match) => {
					if(match) {
						return res.status(200).json(user);
					} else {
						return res.status(400).send("Wrong password!");
					}
				}).catch((error) => {
					return res.status(500).send(error.message);
				});
			} else {
				return res.status(404).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};