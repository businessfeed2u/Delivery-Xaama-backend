//  Requiring database
const mongoose = require("mongoose");

//	Loading Users collection from database
require("../models/User");
const users = mongoose.model("Users");

//	Exporting Development features
module.exports = {
	//	Delete all users on database
	async deleteAllUsers(req, res) {
		if(req.headers.systempassword && (req.headers.systempassword === process.env.SYSTEMPASSWORD)) {
			users.deleteMany().then((response) => {
				if(response.n) {
					return res.status(202).send("All users have been deleted!");
				} else {
					return res.status(400).send("No users have been found!");
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			return res.status(401).send("You don't have permission to do it!");
		}
	}
};