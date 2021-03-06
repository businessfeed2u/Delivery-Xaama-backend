//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//	Loading User and Company schemas
require("../models/User");
require("../models/Company");

//	Loading Users and Companies collections from database
const users = mongoose.model("Users");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");

// Loading dirname
const path = require("path");
const dirname = path.resolve();

//	Exporting User features
module.exports = {
	//	Return an user on database given email
	async index(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send(lang.invId);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				return res.status(200).json(user);
			} else {
				return res.status(400).send(lang.nFUser);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new user
	async create(req, res) {
		const { name, email, password, company } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		const cards = [];
		let i = 0;

		for(const c of company.cards) {
			const data = {
				cardFidelity: c.type,
				qtdCurrent: 0,
				completed: false,
				status: false
			};

			cards[i] = data;

			i++;
		}

		await users.findOne({ email: email.trim().toLowerCase() }).then((response) => {
			if(response) {
				if(filename) {
					try {
						fs.unlinkSync(`${dirname}/uploads/${filename}`);
					} catch(error) {
						return res.status(500).send(error);
					}
				}

				return res.status(400).send(lang.existentEmail);
			} else {
				let salt = 0, hash = "";

				try {
					salt = bcrypt.genSaltSync(10);
					hash = bcrypt.hashSync(password, salt);
				} catch(error) {
					if(filename) {
						try {
							fs.unlinkSync(`${dirname}/uploads/${filename}`);
						} catch(e) {
							return res.status(500).send(e);
						}
					}

					return res.status(500).send(error);
				}

				users.create({
					name,
					email: email.trim().toLowerCase(),
					userType: 0,
					password: hash,
					thumbnail: filename,
					cards
				}).then((user) => {
					if(user) {
						const token = jwt.sign({ userId: user._id, userType: user.userType }, process.env.SECRET, {
							expiresIn: 86400
						});

						return res.status(201).json({ user, token });
					} else {
						if(filename) {
							try {
								fs.unlinkSync(`${dirname}/uploads/${filename}`);
							} catch(e) {
								return res.status(500).send(e);
							}
						}

						return res.status(400).send(lang.failCreate);
					}
				}).catch((error) => {
					if(filename) {
						try {
							fs.unlinkSync(`${dirname}/uploads/${filename}`);
						} catch(e) {
							return res.status(500).send(e);
						}
					}

					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			if(filename) {
				try {
					fs.unlinkSync(`${dirname}/uploads/${filename}`);
				} catch(e) {
					return res.status(500).send(e);
				}
			}

			return res.status(500).send(error);
		});
	},
	//	Update current user on database
	async update(req, res) {
		const userId = req.headers.authorization;
		const { name, email, passwordO, passwordN, address, phone, status } = req.body;

		await users.findOne({ email: email.trim().toLowerCase() }).then((response) => {
			if(response && (response._id != userId)) {
				return res.status(400).send(lang.existentEmail);
			} else {
				users.findById(userId).then((user) => {
					if(user) {
						let hash = "";

						if(passwordN && passwordN.length) {
							if(!regEx.password.test(passwordN)) {
								return res.status(400).send(lang.invNewPassword);
							}

							if(!bcrypt.compareSync(passwordO, user.password)) {
								return res.status(400).send(lang.wrongOldPassword);
							}

							try {
								const salt = bcrypt.genSaltSync(10);
								hash = bcrypt.hashSync(passwordN, salt);
							} catch(error) {
								return res.status(500).send(error);
							}
						} else {
							hash = user.password;
						}

						if(user.cards.length != status.length) {
							return res.status(400).send(lang.invCardVector);
						}

						const data = [];
						let i = 0;

						for(const u of user.cards) {
							const newCard = {
								cardFidelity: u.cardFidelity,
								qtdCurrent: u.qtdCurrent,
								completed: u.completed,
								status: status[i]
							};

							data.push(newCard);
							i ++;
						}

						user.cards = data;
						user.name = name;
						user.email = email.trim().toLowerCase();
						user.password = hash;
						user.phone = phone ? phone : null;
						user.address = address && address.length ? address.split(",").map((a) => a.trim()) : null;

						user.save().then((response) => {
							if(response) {
								return res.status(200).json(user);
							} else {
								return res.status(400).send(lang.failUpdate);
							}
						}).catch((error) => {
							return res.status(500).send(error);
						});
					} else {
						return res.status(404).send(lang.nFUser);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update current user on database
	async updateThumbnail(req, res) {
		const userId = req.headers.authorization;
		const { delImg } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		await users.findById(userId).then((user) => {
			if(user) {
				const deleteThumbnail = filename || (delImg === "true") ? user.thumbnail : null;
				user.thumbnail = filename;

				user.save().then((response) => {
					if(response) {
						if(deleteThumbnail && (deleteThumbnail != user.thumbnail) || (delImg === "true")) {
							try {
								fs.unlinkSync(`${dirname}/uploads/${deleteThumbnail}`);
							} catch(e) {
								return res.status(500).send(e);
							}
						}

						return res.status(200).json(user);
					} else {
						if(filename) {
							try {
								fs.unlinkSync(`${dirname}/uploads/${filename}`);
							} catch(e) {
								return res.status(500).send(e);
							}
						}

						return res.status(400).send(lang.failUpdate);
					}
				}).catch((error) => {
					if(filename) {
						try {
							fs.unlinkSync(`${dirname}/uploads/${filename}`);
						} catch(e) {
							return res.status(500).send(e);
						}
					}

					return res.status(500).send(error);
				});
			} else {
				if(filename) {
					try {
						fs.unlinkSync(`${dirname}/uploads/${filename}`);
					} catch(e) {
						return res.status(500).send(e);
					}
				}

				return res.status(404).send(lang.nFUser);
			}
		}).catch((error) => {
			if(filename) {
				try {
					fs.unlinkSync(`${dirname}/uploads/${filename}`);
				} catch(e) {
					return res.status(500).send(e);
				}
			}

			return res.status(500).send(error);
		});
	},
	//	Update current card of user on database
	async updateCard(req, res) {
		const userId = req.headers["order-user-id"];
		const { cardsNewQtd, company } = req.body;

		await users.findById(userId).then((user) => {
			if(user) {
				const data = [];

				let i = 0;
				for(const qtd of cardsNewQtd) {
					if(!user.cards || !user.cards[i] ||
					(qtd.cardFidelity != user.cards[i].cardFidelity) ||
					(qtd.qtdCurrent < 0)) {

						return res.status(400).send(lang.invCard);
					}

					let q = user.cards[i].qtdCurrent;
					let complete = user.cards[i].completed;
					let s = user.cards[i].status;

					if(company.cards[i].available) {
						if(s) {
							s = false;
							complete = false;
						}

						q += qtd.qtdCurrent;

						if(q >= company.cards[i].qtdMax) {
							q -= company.cards[i].qtdMax;

							if(q >= company.cards[i].qtdMax) {
								q = company.cards[i].qtdMax - 1;
							}
							complete = true;
						}
					}

					const newCard = {
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
						return res.status(200).send(lang.succUpdate);
					} else {
						return res.status(400).send(lang.failUpdate);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(404).send(lang.nFUser);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Remove current user from database
	async delete(req, res) {
		const { password } = req.headers;
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send(lang.invId);
		}

		if(!password || !password.length) {
			return res.status(400).send(lang.invPassword);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				if(user.userType === 2) {
					return res.status(403).send(lang.unauthOperation);
				} else {
					bcrypt.compare(password, user.password).then((match) => {
						if(match) {
							user.remove().then((uDeleted) => {
								if(uDeleted) {
									if(uDeleted.thumbnail) {
										try {
											fs.unlinkSync(`${dirname}/uploads/${uDeleted.thumbnail}`);
										} catch(e) {
											return res.status(200).send(lang.succDeleteButThumb);
										}
									}

									return res.status(200).send(lang.succDelete);
								} else {
									return res.status(400).send(lang.nFUser);
								}
							}).catch((error) => {
								return res.status(500).send(error);
							});
						} else {
							return res.status(400).send(lang.wrongPassword);
						}
					});
				}
			} else {
				return res.status(404).send(lang.nFUser);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update current cards of users on database
	async updateAll(req, res) {
		const userId = req.headers.authorization;
		const { company, allUsers } = req.body;

		await users.findById(userId).then((user) => {
			if(user) {
				if(user.userType != 2) {
					return res.status(404).send(lang.unauthOperation);
				}
			} else {
				return res.status(404).send(lang.nFUser);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});

		for(const u of allUsers) {
			await users.findById(u._id).then((user) => {
				if(user) {
					const data = [];
					let exist = false;

					for(const type of company.productTypes) {
						exist = false;
						for(const c of user.cards) {
							if(type == c.cardFidelity) {
								data.push(c);
								exist = true;
								break;
							}
						}
						if(!exist) {
							const newCard = {
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
						if(!response) {
							return res.status(400).send(lang.failUpdate);
						}
					}).catch((error) => {
						return res.status(500).send(error);
					});
				} else {
					return res.status(404).send(lang.nFUser);
				}
			}).catch((error) => {
				return res.status(500).send(error);
			});
		}

		return res.status(200).send(lang.succUpdate);
	},
	//	Return all users on database
	async all(req, res) {
		await users.find().sort({
			userType: "desc"
		}).then((response) => {
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(404).json(lang.nFUsers);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};
