//  Requiring database and bcryptjs
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading Users collection from database
require("../models/User");
const users = mongoose.model("Users");

// Loading module to delete uploads
const fs = require("fs");

//	Exporting User features
module.exports = {
	//	Return an user on database given email
	async index(req, res) {
		const { email } = req.body;
		
		if(email && email.length) {
			await users.findOne({ email }).then((user) => {
				if(user) {
					return res.status(200).json(user);
				} else {
					return res.status(400).send("No user found!");
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			return res.status(400).send("Email is empty!");
		}
	},
	//	Create a new user
	async create(req, res) {
    const { name, email, password, passwordC } = req.body;
    const filename = (req.file) ? req.file.filename : null;

		if(name && name.length && email && email.length && password && password.length && passwordC && passwordC.length) {
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
								users.create({ name, email, userType: 0, password: hash, thumbnail: filename }).then((response) => {
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
		} else {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }
			return res.status(400).send("Name, email, password or password confirmation are empty!");
		}
	},
	//	Update current user on database
	async update(req, res) {
		const userId = req.headers.authorization;
		const { name, email, passwordO, passwordN } = req.body;

		if(userId && userId.length) {
			if(name && name.length && email && email.length) {
				if(passwordN && passwordN.length > 0) {
					await users.findById(userId).then((user) => {
						if(user) {
							bcrypt.compare(passwordO, user.password).then((match) => {
								if(match) {
									bcrypt.genSalt(10).then((salt) => {
										bcrypt.hash(passwordN, salt).then((hash) => {
											user.name = (name.length > 0) ? name : user.name;
											user.email = (email.length > 0) ? email : user.email;
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
							return res.status(400).send("User not found!");
						}
					}).catch((error) => {
						return res.status(500).send(error);
					});
				}
			} else {
				return res.status(400).send("Name or email are empty!");
			}
		} else {
			return res.status(400).send("No user is logged in!");
		}
	},
	//	Remove current user from database
	async delete(req, res) {
		const userId = req.headers.authorization;

		if(userId && userId.length) {
			await users.findByIdAndDelete(userId).then((user) => {
				if(user) {
					return res.status(202).send("The user has been deleted!");
				} else {
					return res.status(400).send("User not found!");
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		} else {
			return res.status(400).send("No user is logged in!");
		}
	}
};