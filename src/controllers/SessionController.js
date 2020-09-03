//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading Users collection from database
require("../models/User");
const users = mongoose.model("Users");

//	Defining regular expression to validations
const emailRegEx = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/);

//	Exporting Session features
module.exports = {
	//	Return user info from current session
	async index(req, res) {
		const userId = req.headers.authorization;

		if(userId && userId.length) {
			await users.findById(userId).then((user) => {
				if(user) {
					return res.status(200).json(user);
				} else {
					return res.status(400).send("No user found using this email!");
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			return res.status(400).send("No user is logged in!");
		}
	},
	
	//	Create a new session from user info
	async create(req, res) {
		const { email, password } = req.body;

		if(!email || !email.length || !emailRegEx.test(email)) {
			return res.status(400).send("Invalid email!");
		}

		if(!password || !password.length) {
			return res.status(400).send("Invalid password!");
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
				return res.status(400).send("No user found using this email!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};