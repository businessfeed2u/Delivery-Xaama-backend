//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
		const userId = req.params.id;

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
		const { name, email, password, passwordC, cards } = req.body;
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
    
    //	Validating cards fidelity
    if(!cards || !cards.length) {
      errors.push("cards");
    } else {
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
      
      var i = 0;
      for(const card of cards) {
        if(!Company.cards || !Company.cards[i] || 
          (card.cardFidelity.type != Company.cards[i].type) ||
          (card.cardFidelity.available != Company.cards[i].available) ||
          (card.cardFidelity.qtdMax != Company.cards[i].qtdMax) ||
          (card.cardFidelity.discount != Company.cards[i].discount) ||
          (card.qtdCurrent != 0) || (card.completed != false && card.completed != true)) {

            errors.push("card");
            break;
        }

        if(card.qtdCurrent >= card.cardFidelity.qtdMax) {
          card.qtdCurrent = 0;
          card.completed = true;
        }

        i++;
      }
    }
    
		if(password !== passwordC) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("The password confirmation don't match, try again!");
    }
    
    if(errors.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
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
          thumbnail: filename,
          cards: cards,
				}).then((response) => {
					if(response) {
						sendMessage(sendSocketMessageTo, "new-user", response);
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
		const sendSocketMessageTo = await findConnections();

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
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

		if(phone && phone.length && !regEx.phone.test(phone)) {
			errors.push("phone");
		}

		if(address && address.length && !regEx.address.test(address)) {
			errors.push("address");
		}

		if(errors.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
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
							fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
						}

						return res.status(400).send("Invalid new password!");
					}

					if(!bcrypt.compareSync(passwordO, user.password)) {
						if(filename) {
							fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
						}

						return res.status(400).send("Old password don't match, try again!");
					}

					try {
						const salt = bcrypt.genSaltSync(10);
						hash = bcrypt.hashSync(passwordN, salt);
					} catch(error) {
						if(filename) {
							fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
						}

						return res.status(500).send(error.message);
					}
				} else {
					hash = user.password;
				}

				user.name = name;
				user.email = email.trim().toLowerCase();
				user.password = hash;
				user.thumbnail = filename;
				user.phone = phone && phone.length ? phone : null;
				user.address= address && address.length ? address.split(",").map(a => a.trim()) : null;

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

				return res.status(404).send("User not found!" );
			}
		}).catch((error) => {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(500).send(error);
		});
  },

  // vai ir para o frontend:
  // var myMapTypesProducts = new Map();
  // myMapTypesProducts.set(product.product.type, 
  //   myMapTypesProducts.get(product.product.type) ? 
  //   myMapTypesProducts.get(product.product.type) + 1 : 1);

  // TODO:
  // atualizar api na hora de criar usuário
  // na hora do finalizr o pedido, verificar se tem o desconto, se sim aplicálo
  // se uma empresa atualizar as info dos cards, deve atualizar pra todos usuários
  // atualizar cards do usuario quando a empresa enviar o pedido

  //	Update current card of user on database
	async updateCard(req, res) {
    const userAdmId = req.headers.authorization;
    const userId = req.params.id;
		const { cards } = req.body;
		
    const sendSocketMessageTo = await findConnections();
    
    var errors = [];

		if(!userAdmId || !userAdmId.length || !mongoose.Types.ObjectId.isValid(userAdmId)) {
			errors.push("user Adm id");
    }

    if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push("user id");
    }
    
    //	Validating cards fidelity
    if(!cards || !cards.length) {
      errors.push("cards");
    } else {
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
     
      var i = 0;
      for(const card of cards) {
      
        if(!Company.cards || !Company.cards[i] || 
          (card.cardFidelity.type != Company.cards[i].type) ||
          (card.cardFidelity.available != Company.cards[i].available) ||
          (card.cardFidelity.qtdMax != Company.cards[i].qtdMax) ||
          (card.cardFidelity.discount != Company.cards[i].discount) ||
          (card.qtdCurrent < 0) || (card.completed != false && card.completed != true)) {

            errors.push("card");
            break;
        }
      
        if(card.qtdCurrent >= card.cardFidelity.qtdMax) {
          card.qtdCurrent = card.qtdCurrent - card.cardFidelity.qtdMax;
          if(card.qtdCurrent >= card.cardFidelity.qtdMax) {
            card.qtdCurrent = 0;
          }
          card.completed = true;
        }

        i++;
      }
    }

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await users.findById(userAdmId).then((user) => {
			if(user) {
        if(user.userType != 2) {
          return res.status(404).send("User is not adm!" );
        }
			} else {
				return res.status(404).send("User not found!" );
			}
		}).catch((error) => {
			return res.status(500).send(error);
    });
    
    await users.findById(userId).then((user) => {
      if(user) {
        user.cards = cards;
        
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
  
   //	Update current cards of users on database
	async updateAll(req, res) {
    const userAdmId = req.headers.authorization;
    
    var errors = [];

		if(!userAdmId || !userAdmId.length || !mongoose.Types.ObjectId.isValid(userAdmId)) {
			errors.push("user Adm id");
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

		await users.findById(userAdmId).then((user) => {
			if(user) {
        if(user.userType != 2) {
          return res.status(404).send("User is not adm!" );
        }
			} else {
				return res.status(404).send("User not found!" );
			}
		}).catch((error) => {
			return res.status(500).send(error);
    });
    
    await users.updateMany({},{"$set":{"cards": Company.cards}}).then((response) => {
      if(response.n) {
        return res.status(200).send("All users cards have been update!");
      } else {
        return res.status(404).send("Users not found!");
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
					return res.status(401).send("Admin account can't be deleted");
				} else {
					bcrypt.compare(password, user.password).then((match) => {
						if(match) {
							user.remove().then((uDeleted) => {
								if(uDeleted){
									try {
										if(uDeleted.thumbnail){
											fs.unlinkSync(`${__dirname}/../../uploads/${uDeleted.thumbnail}`);
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