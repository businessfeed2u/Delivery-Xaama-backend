//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//	Loading User schema and Users collection from database
require("../models/User");
const users = mongoose.model("Users");

//	Loading Company collection from database
require("../models/Company");
const companyData = mongoose.model("Company");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");

const { findConnections, sendMessage } = require("../config/websocket");

// Loading dirname
const path = require("path");
var __dirname = path.resolve();

//	Exporting User features
module.exports = {
	//	Return an user on database given email
	async index(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send("Invalid id!");
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
		const sendSocketMessageTo = await findConnections();
		var errors = [];


		if(!name || !name.length) {
			errors.push("name");
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push("email");
		}

		if(!password || !password.length || !regEx.password.test(password)) {
			errors.push("password");
		}

		if(!passwordC || !passwordC.length || !regEx.password.test(passwordC)) {
			errors.push("password confirmation");
		}

		var Company;

		await companyData.findOne({}).then((response) => {
			if(response) {
			Company = response;
			} else {
			errors.join("No company data found!");
			}
		}).catch(() => {
			errors.join("Erro ao carregar informações da empresa");
		});

		var cards = [];
		var i = 0;

		for(var c of Company.cards) {
			const data = {
				cardFidelity: c.type,
				qtdCurrent: 0,
				completed: false,
				status: false
			};

			cards[i] = data;

			i++;
		}

		if(password !== passwordC) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/uploads/${filename}`);
			}

			return res.status(400).send("The password confirmation don't match, try again!");
	}

	if(errors.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/uploads/${filename}`);
			}

			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
	}

		await users.findOne({ email: email.trim().toLowerCase() }).then((response) => {
			if(response) {
				if(filename) {
					fs.unlinkSync(`${__dirname}/uploads/${filename}`);
				}

				return res.status(400).send("There is a user using this email, try another!");
			} else {
				var salt = 0, hash = "";

				try {
					salt = bcrypt.genSaltSync(10);
					hash = bcrypt.hashSync(password, salt);
				} catch(error) {
					if(filename) {
						fs.unlinkSync(`${__dirname}/uploads/${filename}`);
					}

					return res.status(500).send(error.message);
				}

				users.create({
					name,
					email: email.trim().toLowerCase(),
					userType: 0,
					password: hash,
					thumbnail: filename,
					cards: cards,
				}).then((user) => {
					if(user) {
            sendMessage(sendSocketMessageTo, "new-user", user);
            const token = jwt.sign({ user }, process.env.SECRET, {
							expiresIn: 86400
						});
						return res.status(200).json({ user, token });
					} else {
						if(filename) {
							fs.unlinkSync(`${__dirname}/uploads/${filename}`);
						}

						return res.status(400).send("We couldn't process your request, try again later!");
					}
				}).catch((error) => {
					if(filename) {
						fs.unlinkSync(`${__dirname}/uploads/${filename}`);
					}

					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			if(filename) {
				fs.unlinkSync(`${__dirname}/uploads/${filename}`);
			}

			return res.status(500).send(error);
		});
	},

	//	Update current user on database
	async update(req, res) {
    const userId = req.headers.authorization;
		const { name, email, passwordO, passwordN, address, phone, status, delImg } = req.body;
		const filename = (req.file) ? req.file.filename : null;
		const sendSocketMessageTo = await findConnections();

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/uploads/${filename}`);
			}

			return res.status(400).send("Invalid id!");
		}
		var errors = [];

		if(!name || !name.length) {
			errors.push("name");
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push("email");
		}

		if(!phone || !phone.length || !regEx.phone.test(phone)) {
			errors.push("phone");
		}

		if(!address || !address.length || !regEx.address.test(address)) {
			errors.push("address");
		}

		if(!status || !status.length) {
			errors.push("vector of status");
		}

    if(!delImg || !delImg.length) {
      errors.push("vector of status");
    }

		if(errors.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/uploads/${filename}`);
			}

			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				var hash = "";

				if(passwordN && passwordN.length) {
					if(!regEx.password.test(passwordN)) {
						if(filename) {
							fs.unlinkSync(`${__dirname}/uploads/${filename}`);
						}

						return res.status(400).send("Invalid new password!");
					}

					if(!bcrypt.compareSync(passwordO, user.password)) {
						if(filename) {
							fs.unlinkSync(`${__dirname}/uploads/${filename}`);
						}

						return res.status(400).send("Old password don't match, try again!");
					}

					try {
						const salt = bcrypt.genSaltSync(10);
						hash = bcrypt.hashSync(passwordN, salt);
					} catch(error) {
						if(filename) {
							fs.unlinkSync(`${__dirname}/uploads/${filename}`);
						}

						return res.status(500).send(error.message);
					}
				} else {
					hash = user.password;
        }

        var s = status.split(",");
        
        if(user.cards.length != s.length) {
          if(filename) {
            fs.unlinkSync(`${__dirname}/uploads/${filename}`);
          }

          return res.status(400).send("vector length of status");
        }

        var data = [];
        var i = 0;
        
        for(var u of user.cards) {
          var newCard = {
            cardFidelity: u.cardFidelity,
            qtdCurrent: u.qtdCurrent,
            completed: u.completed,
            status: (s[i] === "true")
          };
          
          data.push(newCard);
          i ++; 
        }

        user.cards = data;
				user.name = name;
				user.email = email.trim().toLowerCase();
        user.password = hash;
        
        if(phone == "99999999999") {
          user.phone = null;
        } else {
          user.phone = phone && phone.length ? phone : null;
        }
        
        if(address == "Rua, 1, Bairro, Casa") {
          user.address = null;
        } else {
          user.address = address && address.length ? address.split(",").map(a => a.trim()) : null;
        }

        var deleteThumbnail = filename || (delImg === "true") ? user.thumbnail : null;
        
        user.thumbnail = filename;

				user.save().then((response) => {
					if(response) {
            if(deleteThumbnail && (deleteThumbnail != user.thumbnail) || (delImg === "true")) {
							fs.unlinkSync(`${__dirname}/uploads/${deleteThumbnail}`);
            }

						users.find().sort({
							userType: "desc"
						}).then((response) => {
							sendMessage(sendSocketMessageTo, "update-user", response);
						}).catch((error) => {
							return res.status(500).send(error);
						});

						return res.status(200).send("Successful on changing your data!");
					} else {
						if(filename) {
							fs.unlinkSync(`${__dirname}/uploads/${filename}`);
						}

						return res.status(400).send("We couldn't save your changes, try again later!");
					}
				}).catch((error) => {
					if(filename) {
						fs.unlinkSync(`${__dirname}/uploads/${filename}`);
					}

					return res.status(500).send(error);
				});
			} else {
				if(filename) {
					fs.unlinkSync(`${__dirname}/uploads/${filename}`);
				}

				return res.status(404).send("User not found!" );
			}
		}).catch((error) => {
			if(filename) {
				fs.unlinkSync(`${__dirname}/uploads/${filename}`);
			}

			return res.status(500).send(error);
		});
  },

  //	Update current card of user on database
	async updateCard(req, res) {
		const userAdmId = req.headers.authorization;
		const userId = req.headers["order-user-id"];
		const { cardsNewQtd } = req.body;
		const sendSocketMessageTo = await findConnections();
		var errors = [];

		if(!userAdmId || !userAdmId.length || !mongoose.Types.ObjectId.isValid(userAdmId)) {
			errors.push("user Adm id");
		}

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
				errors.push("user id");
		}

		//	Validating cards fidelity
		var Company = null;

		if(!cardsNewQtd || !cardsNewQtd.length) {
			errors.push("cardsNewQtd");
		} else {
			await companyData.findOne({}).then((response) => {
				if(response) {
					Company = response;
				} else {
					errors.push("No company data found!");
				}
			}).catch(() => {
				errors.push("Erro ao carregar informações da empresa");
			});

			if(cardsNewQtd.length != Company.cards.length) {
				return res.status(400).send("Invalid cards lenght value");
			}
		}

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				var data = [];

				var i = 0;
				for(const qtd of cardsNewQtd) {
					if(!user.cards || !user.cards[i] ||
					(qtd.cardFidelity != user.cards[i].cardFidelity) ||
					(qtd.qtdCurrent < 0)) {

						return res.status(400).send("Invalid card value");
					}

					var q = user.cards[i].qtdCurrent;
					var complete = user.cards[i].completed;
					var s = user.cards[i].status;

					if(Company.cards[i].available) {
						if(!complete && s) {
							return res.status(400).send("Invalid completed and satus value");
						}

						if(s) {
							s = false;
							complete = false;
						}

						q = q + qtd.qtdCurrent;

						if(q >= Company.cards[i].qtdMax) {
							q = q - Company.cards[i].qtdMax;

							if(q >= Company.cards[i].qtdMax) {
								q = Company.cards[i].qtdMax - 1;
							}
							complete = true;
						}
					}

					var newCard = {
						cardFidelity: qtd.cardFidelity,
						qtdCurrent: q,
						completed: complete,
						status: s
					};

					data.push(newCard);
					i++;
				}

				user.cards = data;

				user.save().then((response) => {
					if(response) {
						users.find().sort({
							userType: "desc"
						}).then((response) => {
							sendMessage(sendSocketMessageTo, "update-user", response);
						}).catch((error) => {
							return res.status(500).send(error);
						});

						return res.status(200).send("Successful on changing your data!");
					} else {
						return res.status(400).send("We couldn't save your changes, try again later!");
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});

			} else {
				return res.status(404).send("User not found!" );
			}
		}).catch((error) => {
				return res.status(500).send(error);
		});
  },

	//	Remove current user from database
	async delete(req, res) {
		const { password } = req.headers;
		const userId = req.headers.authorization;
		const sendSocketMessageTo = await findConnections();
		var errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push("id");
		}

		if(!password || !password.length) {
			errors.push("password");
		}

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				if(user.userType === 2) {
					return res.status(403).send("Admin account can't be deleted");
				} else {
					bcrypt.compare(password, user.password).then((match) => {
						if(match) {
							user.remove().then((uDeleted) => {
								if(uDeleted){
									try {
										if(uDeleted.thumbnail){
											fs.unlinkSync(`${__dirname}/uploads/${uDeleted.thumbnail}`);
										}

										users.find().sort({
											userType: "desc"
										}).then((response) => {
											sendMessage(sendSocketMessageTo, "delete-user", response);
										}).catch((error) => {
											return res.status(500).send(error);
										});

										return res.status(200).send("The user has been deleted!");
									} catch(e) {
										return res.status(200).send("The user has been deleted, but the profile picture was not found!");
									}
								} else {
									return res.status(400).send("User not found!");
								}
							}).catch((error) => {
								return res.status(500).send(error);
							});
						} else {
							return res.status(400).send("Wrong password, try again!");
						}
					});
				}
			} else {
				return res.status(404).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },

  //	Update current cards of users on database
	async updateAll(req, res) {
		const userId = req.headers.authorization;
		var errors = [];

			if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
				errors.push("user id");
		}

		var Company;

		await companyData.findOne({}).then((response) => {
			if(response) {
			Company = response;
			} else {
			errors.push("No company data found!");
			}
		}).catch(() => {
			errors.push("Erro ao carregar informações da empresa");
		});

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				if(user.userType != 2) {
					return res.status(404).send("User is not adm!");
				}
			} else {
				return res.status(404).send("User not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
	});

	var allUsers;

	await users.find()
	.then((response) => {
			allUsers = response;
	}).catch((error) => {
		return res.status(500).send(error);
	});

	for(var u of allUsers) {
		await users.findById(u._id).then((user) => {
			if(user) {
				var data = [];
				var exist = false;

				for(var type of Company.productTypes) {
					exist = false;
					for(var c of user.cards) {
						if(type == c.cardFidelity) {
						data.push(c);
						exist = true;
						break;
						}
					}
					if(!exist) {
						var newCard = {
							cardFidelity: type,
							qtdCurrent: 0,
							completed: false,
							status: false
						};
						data.push(newCard);
					}
				}
				user.cards = data;

				user.save().then((response) => {
					if(response) {
						return res;
					} else {
						return res.status(400).send("We couldn't save your changes, try again later!");
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(404).send("User not found!" );
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}

	return res.status(200).send("All users cards have been update!");

	},

	//	Return all users on database
	async all(req, res) {
		await users.find().sort({
			userType: "desc"
		}).then((response) => {
			return res.status(200).json(response);
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};