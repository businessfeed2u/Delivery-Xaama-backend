//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading User schema and Users collection from database
require("../models/User");
const users = mongoose.model("Users");

// Loading module to delete uploads
const fs = require("fs");
const { exception } = require("console");

//	Exporting User features
module.exports = {
	//	Return an user on database given email
	async index(req, res) {
		const userId = req.params.id;

		if(!userId || !userId.length) {
			return res.status(400).send("No user is logged in!");
		}
		
		await users.findById(userId).then((user) => {
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
		const filename = (req.file) ? req.file.filename : null;

		if(!name || !name.length || !email || !email.length || !password || !password.length || !passwordC || !passwordC.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Name, email, password or password confirmation are empty!");
		}

		if(password !== passwordC) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}
			
			return res.status(400).send("The password confirmation don't match, try again!");
		}

		await users.findOne({ email: email.trim().toLowerCase() }).then((response) => {
			if(response) {
				if(filename) {
					fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
				}

				return res.status(400).send("There is a user using this email, try another!");
			} else {
				var salt = 0, hash = "";

				try {
					salt = bcrypt.genSaltSync(10);
					hash = bcrypt.hashSync(password, salt);
				} catch(error) {
					if(filename) {
						fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
					}
					
					return res.status(500).send(error.message);
				}
				
				users.create({ 
					name, 
					email: email.trim().toLowerCase(), 
					userType: 0, 
					password: hash, 
					thumbnail: filename })
				.then((response) => {
					if(response) {
						return res.status(201).json(response);
					} else {
						if(filename) {
							fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
						}

						return res.status(400).send("We couldn't process your request, try again later!");
					}
				}).catch((error) => {
					if(filename) {
						fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
					}

					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}
			
			return res.status(500).send(error);
		});
	},

	//	Update current user on database
	async update(req, res) {
		const userId = req.headers.authorization;
		const { name, email, passwordO, passwordN, address, phone } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!userId || !userId.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("No user is logged in!");
		}
		
		if(!name || !name.length || !email || !email.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Name or email are empty!");
    }
    
    

		if(passwordN && passwordN.length > 0) {
			await users.findById(userId).then((user) => {
				if(user) {
					bcrypt.compare(passwordO, user.password).then((match) => {
						if(match) {
							try {
								fs.unlinkSync(`${__dirname}/../../uploads/${user.thumbnail}`);
							} catch(error) {
								//
							}

							var salt = 0, hash = "";

							try {
								salt = bcrypt.genSaltSync(10);
								hash = bcrypt.hashSync(passwordN, salt);
							} catch(error) {
								if(filename) {
									fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
								}

								return res.status(500).send(error.message);
							}

							user.name = (name.length > 0) ? name : user.name;
							user.email = (email.length > 0) ? email.trim().toLowerCase() : user.email;
							user.password = hash;
              user.thumbnail = filename;
              user.phone = (phone.length > 0) ? phone : user.phone;
              user.address= (address.length > 0) ? (address.split(",").map(a => a.trim())) : user.address;
						
							user.save().then((response) => {
								if(response) {
									return res.status(202).send("Successful on changing your data!");
								} else {
									if(filename) {
										fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
									}

									return res.status(400).send("We couldn't save your changes, try again later!");
								}
							}).catch((error) => {
								if(filename) {
									fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
								}

								return res.status(500).send(error);
							});
						} else {
							if(filename) {
								fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
							}

							return res.status(400).send("Old password don't match, try again!");
						}
					}).catch((error) => {
						if(filename) {
							fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
						}

						return res.status(500).send(error.message);
					});
				} else {
					if(filename) {
						fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
					}

					return res.status(400).send("User not found!" );
				}
			}).catch((error) => {
				if(filename) {
					fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
				}

				return res.status(500).send(error);
			});
		} else {
			await users.findById(userId).then((user) => {
				if(user) {
					try {
						fs.unlinkSync(`${__dirname}/../../uploads/${user.thumbnail}`);
					} catch(e) {
						//
					}

					user.name = (name.length > 0 ) ? name : user.name;
					user.email = (email.length > 0 ) ? email.trim().toLowerCase() : user.email;
          user.thumbnail = filename;
          user.phone = phone;
          user.address= address ? (address.split(",").map(a => a.trim())) : user.address;
				
					user.save().then((response) => {
						if(response) {
							return res.status(202).send("Successful on changing your data!");
						} else {
							if(filename) {
								fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
							}
							
							return res.status(400).send("We couldn't save your changes, try again later!");
						}
					}).catch((error) => {
						if(filename) {
							fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
						}

						return res.status(500).send(error);
					});
				} else {
					if(filename) {
						fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
					}

					return res.status(400).send("User not found!");
				}
			}).catch((error) => {
				if(filename) {
					fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
				}

				return res.status(500).send(error);
			});
		}
	},

	//	Remove current user from database
	async delete(req, res) {
		const userId = req.headers.authorization;


		if(!userId || !userId.length) {
			return res.status(400).send("No user is logged in or password is empty!");
		}

		await users.findById(userId).then((user) => {
			if(user) {
				if(user.userType == 2) {
					return res.status(401).send("Admin account can't be deleted");
				} else {
          user.remove().then((uDeleted) => {
            if(uDeleted) {
              try {
                fs.unlinkSync(`${__dirname}/../../uploads/${uDeleted.thumbnail}`);
    
                return res.status(202).send("The user has been deleted!");
              } catch(e) { 
                return res.status(202).send("The user has been deleted, but the profile picture was not found!");
              }
            } else {
              return res.status(400).send("User not found!");
            }
          }).catch((error) => {
            return res.status(500).send(error);
          });
				}
			} else {
				return res.status(400).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Return all users on database
	async all(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length) {
			return res.status(400).send("No user is logged in!");
		}
		
		await users.find().then((response) => {
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(400).send("No user found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};