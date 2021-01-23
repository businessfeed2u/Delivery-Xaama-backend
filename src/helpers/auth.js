//  Loading jwt and dotenv modules
const jwt = require("jsonwebtoken");
require("dotenv").config();

//	Loading helpers
const lang = require("./lang");

module.exports = {
	//	Verify if current user is admin
	async admin(req, res, next) {
		const token = req.headers["x-access-token"];

		if(!token) {
			return res.status(403).send(lang["noToken"]);
		} else {
			jwt.verify(token, process.env.SECRET, (err, decoded) => {
				if(err) {
					return res.status(401).send(lang["invToken"]);
				} else {
					if(decoded.user.userType != 2) {
						return res.status(403).send(lang["unauthOperation"]);
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
			return res.status(403).send(lang["noToken"]);
		} else {
			jwt.verify(token, process.env.SECRET, (err, decoded) => {
				if(err) {
					return res.status(401).send(lang["invToken"]);
				} else {
					if(decoded.user.userType != 1 && decoded.user.userType != 2) {
						return res.status(403).send(lang["unauthOperation"]);
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
			return res.status(403).send(lang["noToken"]);
		} else {
			jwt.verify(token, process.env.SECRET, (err, decoded) => {
				if(err) {
					return res.status(401).send(lang["invToken"]);
				} else {
					req.headers.authorization = decoded.user.id;
					req.body.user = decoded.user;
					return next();
				}
			});
		}
	}
};