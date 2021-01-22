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
const lang = require("../helpers/lang");

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
			return res.status(400).send(lang["invId"]);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				return res.status(200).json(user);
			} else {
				return res.status(400).send(lang["nFUser"]);
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
			errors.push(lang["invUserName"]);
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push(lang["invEmail"]);
		}

		if(!password || !password.length || !regEx.password.test(password)) {
			errors.push(lang["invPassword"]);
		}

		if(!passwordC || !passwordC.length || !regEx.password.test(passwordC)) {
			errors.push(lang["invPasswordConfirmation"]);
		}

		const company = await companyData.findOne({}).exec();
		if(!company) {
			res.status(400).send(lang["nFCompanyInfo"]);
		}

		var cards = [];
		var i = 0;

		for(var c of company.cards) {
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
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(error) {
          return res.status(500).send(error);
        }
      }
      return res.status(400).send(lang["wrongPasswordConfirmation"]);
		}

		if(errors.length) {
			if(filename) {
				try {
					fs.unlinkSync(`${__dirname}/uploads/${filename}`);
				} catch(error) {
					return res.status(500).send(error);
				}
			}
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await users.findOne({ email: email.trim().toLowerCase() }).then((response) => {
			if(response) {
        if(filename) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${filename}`);
          } catch(error) {
            return res.status(500).send(error);
          }
        }
        return res.status(400).send(lang["existentEmail"]);
			} else {
				var salt = 0, hash = "";

				try {
					salt = bcrypt.genSaltSync(10);
					hash = bcrypt.hashSync(password, salt);
				} catch(error) {
          if(filename) {
            try {
              fs.unlinkSync(`${__dirname}/uploads/${filename}`);
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
					cards: cards,
				}).then((user) => {
					if(user) {
            sendMessage(sendSocketMessageTo, "new-user", user);
            const token = jwt.sign({ user }, process.env.SECRET, {
							expiresIn: 86400
						});
						return res.status(201).json({ user, token });
					} else {
            if(filename) {
              try {
                fs.unlinkSync(`${__dirname}/uploads/${filename}`);
              } catch(e) {
                return res.status(500).send(e);
              }
            }
            return res.status(400).send(lang["failUserCreate"]);
					}
				}).catch((error) => {
          if(filename) {
            try {
              fs.unlinkSync(`${__dirname}/uploads/${filename}`);
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
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
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
    const sendSocketMessageTo = await findConnections();

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send(lang["invId"]);
		}
		var errors = [];

		if(!name || !name.length) {
			errors.push(lang["invUserName"]);
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push(lang["invEmail"]);
		}

		if(phone && phone.length && !regEx.phone.test(phone)) {
			errors.push(lang["invPhone"]);
		}

		if(address && address.length && !regEx.address.test(address)) {
			errors.push(lang["invAddress"]);
		}

		if(!status || !status.length) {
			errors.push("vector of status");
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
    }

    await users.findOne({ email: email.trim().toLowerCase() }).then((response) => {
      if(response && (response._id != userId)) {
        return res.status(400).send(lang["existentEmail"]);
			} else {
        users.findById(userId).then((user) => {
          if(user) {
            var hash = "";

            if(passwordN && passwordN.length) {
              if(!regEx.password.test(passwordN)) {
                return res.status(400).send(lang["invNewPassword"]);
              }

              if(!bcrypt.compareSync(passwordO, user.password)) {
                return res.status(400).send(lang["wrongOldPassword"]);
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
              return res.status(400).send("vector length of status");
            }

            var data = [];
            var i = 0;

            for(var u of user.cards) {
              var newCard = {
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
            user.address = address && address.length ? address.split(",").map(a => a.trim()) : null;

            user.save().then((response) => {
              if(response) {
                users.find().sort({
                  userType: "desc"
                }).then((response) => {
                  sendMessage(sendSocketMessageTo, "update-user", response);
                }).catch((error) => {
                  return res.status(500).send(error);
                });

                const token = jwt.sign({ user }, process.env.SECRET, {
                  expiresIn: 86400
                });

                return res.status(200).json({ token, user });
              } else {
                return res.status(400).send(lang["failUserUpdate"]);
              }
            }).catch((error) => {
              return res.status(500).send(error);
            });
          } else {
            return res.status(404).send(lang["nFUser"]);
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
    const sendSocketMessageTo = await findConnections();

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(e) {
          return res.status(500).send(e);
        }
      }
      return res.status(400).send(lang["invId"]);
    }

    if(!delImg || !delImg.length) {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(e) {
          return res.status(500).send(e);
        }
      }
      return res.status(400).send("Invalid delImg!");
    }

		await users.findById(userId).then((user) => {
			if(user) {

        var deleteThumbnail = filename || (delImg === "true") ? user.thumbnail : null;

        user.thumbnail = filename;

				user.save().then((response) => {
					if(response) {
            if(deleteThumbnail && (deleteThumbnail != user.thumbnail) || (delImg === "true")) {
							try {
                fs.unlinkSync(`${__dirname}/uploads/${deleteThumbnail}`);
              } catch(e) {
                //
              }
            }

						users.find().sort({
							userType: "desc"
						}).then((response) => {
							sendMessage(sendSocketMessageTo, "update-user", response);
						}).catch((error) => {
							return res.status(500).send(error);
						});

            const token = jwt.sign({ user }, process.env.SECRET, {
							expiresIn: 86400
						});

						return res.status(200).json({ token, user });
					} else {
            if(filename) {
              try {
                fs.unlinkSync(`${__dirname}/uploads/${filename}`);
              } catch(e) {
                return res.status(500).send(e);
              }
            }

						return res.status(400).send(lang["failUserUpdate"]);
					}
				}).catch((error) => {
					if(filename) {
            try {
              fs.unlinkSync(`${__dirname}/uploads/${filename}`);
            } catch(e) {
              return res.status(500).send(e);
            }
          }

					return res.status(500).send(error);
				});
			} else {
				if(filename) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${filename}`);
          } catch(e) {
            return res.status(500).send(e);
          }
        }

				return res.status(404).send(lang["nFUser"]);
			}
		}).catch((error) => {
			if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
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
		const { cardsNewQtd } = req.body;
		const sendSocketMessageTo = await findConnections();
		var errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		//	Validating cards fidelity
		var Company = null;

		if(!cardsNewQtd || !cardsNewQtd.length) {
			errors.push("cardsNewQtd");
		} else {
			Company = await companyData.findOne({}).exec();
			if(!Company) {
				res.status(400).send(lang["nFCompanyInfo"]);
			}

			if(cardsNewQtd.length != Company.cards.length) {
				return res.status(400).send("Invalid cards lenght value");
			}
		}

		if(errors.length) {
			const message = errors.join(", ");

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

						return res.status(200).send(lang["succUserUpdate"]);
					} else {
						return res.status(400).send(lang["failUserUpdate"]);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});

			} else {
				return res.status(404).send(lang["nFUser"]);
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
			errors.push(lang["invId"]);
		}

		if(!password || !password.length) {
			errors.push(lang["invPassword"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				if(user.userType === 2) {
					return res.status(403).send(lang["unauthOperation"]);
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

										return res.status(200).send(lang["succUserDelete"]);
									} catch(e) {
										return res.status(200).send(lang["succUserDeleteButThumb"]);
									}
								} else {
									return res.status(400).send(lang["nFUser"]);
								}
							}).catch((error) => {
								return res.status(500).send(error);
							});
						} else {
							return res.status(400).send(lang["wrongPassword"]);
						}
					});
				}
			} else {
				return res.status(404).send(lang["nFUser"]);
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
			errors.push(lang["invId"]);
		}

		const Company = await companyData.findOne({}).exec();
		if(!Company) {
			errors.push(lang["nFCompanyInfo"]);
		}

		const allUsers = await users.find().exec();
		if(!allUsers) {
			errors.push(lang["nFUsers"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				if(user.userType != 2) {
					return res.status(404).send(lang["unauthOperation"]);
				}
			} else {
				return res.status(404).send(lang["nFUser"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});

		for(const u of allUsers) {
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
							return res.status(400).send(lang["failUserUpdate"]);
						}
					}).catch((error) => {
						return res.status(500).send(error);
					});
				} else {
					return res.status(404).send(lang["nFUser"]);
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
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(404).json(lang["nFUsers"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};