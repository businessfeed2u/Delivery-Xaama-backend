//  Requiring database and bcryptjs
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading Users collection from database
require("../models/User");
const users = mongoose.model("Usuarios");

//	Exporting Session features
module.exports = {
	//	Return user info from current session
   	async index(req, res) {
		const userId = req.headers.authorization;

		await users.findById(userId).then((user) => {
			if(user) {
				return res.status(200).json(user);
			} else {
				return res.status(400).send("No user found using this email!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new session from user info
   	async create(req, res) {
		const { email, password } = req.body;

		await users.findOne({ email: email }).then((user) => {
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
				return res.status(400).send("No user found using this email!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};