//  Requiring database and bcryptjs
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading Users and Contacts collections from database
require("../models/User");
require("../models/Contact");
const users = mongoose.model("Usuarios");
const contacts = mongoose.model("Contatos");

//	Exporting User features
module.exports = {
	//	Return an user on database given email
	async index(req, res) {
		const { email } = req.body;
		
		await users.findOne({ email }).then((user) => {
			if(user) {
				return res.status(200).json(user);
			} else {
				return res.status(400).send("No user found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new user
	async create(req, res) {
		const { name, email, password, passwordC } = req.body;

		if(password !== passwordC) {
			return res.status(400).send("The password confirmation don't match, try again!");
		} else {
			await users.findOne({ email: email }).then((response) => {
				if(response) {
					return res.status(400).send("There is a user using this email, try another!");
				}
				else {
					bcrypt.genSalt(10).then((salt) => {
						bcrypt.hash(password, salt).then((hash) => {
							users.create({ name, email, password: hash }).then((response) => {
								if(response) {
									return res.status(201).json(response);
								} else {
									return res.status(400).send("We couldn't process your request, try again later!");
								}
							}).catch((error) => {
								return res.status(500).send(error);
							});
						}).catch((error) => {
							return res.status(500).send(error.message);
						});
					}).catch((error) => {
						return res.status(500).send(error.message);
					});
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		}
	},
	//	Update current user on database
	async update(req, res) {
		const userId = req.headers.authorization;
		const { name, email, passwordO, passwordN } = req.body;

		if(passwordN && passwordN.length > 0) {
			await users.findById(userId).then((user) => {
				if(user) {
					bcrypt.compare(passwordO, user.password).then((match) => {
						if(match) {
							bcrypt.genSalt(10).then((salt) => {
								bcrypt.hash(passwordN, salt).then((hash) => {
									user.name = (name.length > 0 ) ? name : user.name;
									user.email = (email.length > 0 ) ? email : user.email;
									user.password = hash;
					
									user.save().then((response) => {
										if(response) {
											return res.status(202).json("Successful on changing your data!");
										} else {
											return res.status(400).send("We couldn't save your changes, try again later!");
										}
									}).catch((error) => {
										return res.status(500).send(error);
									});
								}).catch((error) => {
									return res.status(500).send(error.message);
								});
							}).catch((error) => {
								return res.status(500).send(error.message);
							});
						} else {
							return res.status(400).send("Old password don't match, try again!");
						}
					}).catch((error) => {
						return res.status(500).send(error.message);
					});
				} else {
					return res.status(400).send("User not found!" );
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			await users.findById(userId).then((user) => {
				if(user) {
					user.name = (name.length > 0 ) ? name : user.name;
					user.email = (email.length > 0 ) ? email : user.email;
	
					user.save().then((response) => {
						if(response) {
							return res.status(202).send("Successful on changing your data!");
						} else {
							return res.status(400).send("We couldn't save your changes, try again later!");
						}
					}).catch((error) => {
						return res.status(500).send(error);
					});
				} else {
					return res.status(400).send("User not found!" );
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		}
	},
	//	Remove current user from database
	async delete(req, res) {
		const userId = req.headers.authorization;

		await users.findByIdAndDelete(userId).then((user) => {
			if(user) {
				contacts.deleteMany({ idUser: user._id }).then(() => {
					return res.status(202).send("The user and all his contacts have been deleted!");
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(400).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};