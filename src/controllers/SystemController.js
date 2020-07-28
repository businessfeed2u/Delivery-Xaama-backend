//  Requiring database and dotenv
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//	Loading Users and Contacts collections from database
require("../models/User");
require("../models/Contact");
const users = mongoose.model("Usuarios");
const contacts = mongoose.model("Contatos");

//	Exporting Session features
module.exports = {
	//	Return all users on database
	async allUsers(req, res) {
		if(req.headers.authorization && (req.headers.authorization === process.env.SYSTEMPASSWORD)) {
			await users.find().then((response) => {
				if(response) {
					return res.status(200).json(response);
				} else {
					return res.status(400).send("No user found!");
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			return res.status(401).send("You don't have permission to do it!");
		}
	},
	//	Return all contacts on database
	async allContacts(req, res) {
		if(req.headers.authorization && (req.headers.authorization === process.env.SYSTEMPASSWORD)) {
			await contacts.find().then((response) => {
				if(response) {
					return res.status(200).json(response);
				} else {
					return res.status(400).send("No contacts found!");
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			return res.status(401).send("You don't have permission to do it!");
		}
	},
	//	Delete all users on database
	async deleteAllUsers(req, res) {
		if(req.headers.authorization && (req.headers.authorization === process.env.SYSTEMPASSWORD)) {
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
	},
	//	Delete all contacts on database
	async deleteAllContacts(req, res) {
		if(req.headers.authorization && (req.headers.authorization === process.env.SYSTEMPASSWORD)) {
			contacts.deleteMany().then((response) => {
				if(response.n) {
					return res.status(202).send("All contacts have been deleted!");
				} else {
					return res.status(400).send("No contacts have been found!");
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			return res.status(401).send("You don't have permission to do it!");
		}
	}
};