//  Loading jwt and dotenv modules
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

//	Loading User schema and Users collection from database
require("../models/User");
const users = mongoose.model("Users");

module.exports = {
	
	//	Verify if current user is admin
	async admin(req, res, next) {
		const token = req.headers["x-access-token"];

		if(!token) {
			return res.status(403).send("No token provided!");
		} else {
			jwt.verify(token, process.env.SECRET, (err, decoded) => {
				if(err) {
					return res.status(401).send("Invalid token!");
				} else {
					if(decoded.user.userType != 2) {
						return res.status(403).send("User not authorized!");
					} else {
						req.headers.authorization = decoded.user.id;
						return next();
					}
				}
			});
		}
	},
	//	Verify if current user is a manager
	async manager(req, res, next) {
		const token = req.headers["x-access-token"];

		if(!token) {
			return res.status(403).send("No token provided!");
		} else {
			jwt.verify(token, process.env.SECRET, (err, decoded) => {
				if(err) {
					return res.status(401).send("Invalid token!");
				} else {
					if(decoded.user.userType != 1 && decoded.user.userType != 2) {
						return res.status(403).send("User not authorized!");
					} else {
						req.headers.authorization = decoded.user.id;
						return next();
					}
				}
			});
		}
	},
	//	Vefify if current session is valid
	async verify(req, res, next) {
		const token = req.headers["x-access-token"];

		if(!token) {
			return res.status(403).send("No token provided!");
		} else {
			jwt.verify(token, process.env.SECRET, (err, decoded) => {
				if(err) {
					return res.status(401).send("Invalid token!");
				} else {
          req.headers.authorization = decoded.user.id;
          req.body.user = decoded.user;
          return next();
					
					// users.findById(decoded.user.id).then((user) => {
					// 	if(user) {
					// 		req.body.user = user;
					// 		return next();
					// 	} else {
					// 		return res.status(400).send("No user found!");
					// 	}
					// }).catch((error) => {
					// 	return res.status(500).send(error);
					// });
				}
			});
		}
	}
};