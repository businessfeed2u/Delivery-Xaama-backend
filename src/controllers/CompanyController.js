//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading Company collection from database
require("../models/Company");
const companyData = mongoose.model("Company");

//	Loading User schema and Users collection from database
require("../models/User");
const users = mongoose.model("Users");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");

// Loading dirname
const path = require("path");
var __dirname = path.resolve();

//	Exporting Admin features
module.exports = {
	//	Return product types on database
	async productTypes(req, res) {
		await companyData.findOne({}).then((response) => {
			if(response) {
				return res.status(200).json(response.productTypes);
			} else {
				return res.status(404).send(lang["nFProductTypes"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Return Company data
	async companyData(req, res) {
		await companyData.findOne({}).then((response) => {
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send(lang["nFCompanyInfo"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create or update company data
	async update(req, res) {
		const {
			name,
			email,
			phone,
			address,
			freight,
			productTypes,
			manual,
			systemOpenByAdm,
			timeWithdrawal,
			timeDeliveryI,
			timeDeliveryF
		} = req.body;
		var errors = [];

		if(!name || !name.length) {
			errors.push(lang["invCompanyName"]);
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push(lang["invEmail"]);
		}

		if(!phone || !phone.length || !regEx.phone.test(phone)) {
			errors.push(lang["invPhone"]);
		}

		if(!address || !address.length || !regEx.address.test(address)) {
			errors.push(lang["invAddress"]);
		}

		if(!freight || freight < 1 || freight > 10) {
			errors.push(lang["invCompanyFreight"]);
		}

		if(!productTypes || !productTypes.length || !regEx.seq.test(productTypes)) {
			errors.push(lang["invCompanyProductTypes"]);
		}

		const typesP = productTypes.split(",").map(productType => productType.trim().toLowerCase());

		if(timeWithdrawal < 10 || timeDeliveryI < 10 || timeDeliveryF < 10
		|| timeDeliveryI > timeDeliveryF || timeDeliveryI === timeDeliveryF) {
				errors.push(lang["invTime"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		const company = await companyData.findOne({});
		if(!company) {
				return res.status(404).send(lang["nFCompanyInfo"]);
		}

		var data = [];
		var exist = false;

		for(var type of typesP) {
			exist = false;
			for(var c of company.cards) {
				if(type == c.type) {
					data.push(c);
					exist = true;
					break;
				}
			}
			if(!exist) {
				var newCard = {
					type: type,
					available: false,
					qtdMax: 10,
					discount : 8
				};
				data.push(newCard);
			}
		}

		await companyData.findOneAndUpdate({}, {
			name,
			email,
			phone,
			address,
			freight,
			productTypes: typesP,
			manual,
			systemOpenByAdm,
			timeWithdrawal,
			timeDeliveryI,
			timeDeliveryF,
			cards: data
		}).then((response) => {
			if(response) {
				return res.status(200).json({ company : response });
			} else {
				companyData.create({
					name,
					email,
					phone,
					address,
					freight,
					productTypes: typesP,
					manual,
					systemOpenByAdm,
					cards: data
				}).then((company) => {
					if(company) {
						return res.status(201).json(company);
					} else {
						return res.status(400).send(lang["failCreate"]);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update images for company
	async updateImages(req, res) {
		const { op } = req.body;
    const image = (req.file) ? req.file.filename : null;

     //  Checking if the upload is really an image
     var mimeType = req.file ? req.file : null;

     if(mimeType) {
       mimeType = mimeType.mimetype;
       mimeType = mimeType.split("/", 1) + "";

       if(!mimeType || !mimeType.length || (mimeType != "image")) {
         return res.status(400).send(lang["invTypeImage"]);
       }
     }

		if(!op || !op.length) {
			if(image) {
				try {
					fs.unlinkSync(`${__dirname}/uploads/${image}`);
				} catch(error) {
					return res.status(500).send(error);
				}
			}

			return res.status(400).send(lang["invOperation"]);
		}

		var im = null;
		var data = [];
		var i = 0;

		await companyData.findOne({}).then((company) => {
			if(company) {
				if(op === "logo") {
					im = company.logo;
					company.logo = image ? image : company.logo;
				} else if(op === "c1") {
					im = company.carousel[0] ? company.carousel[0] : null;

					data = [];
					i = 0;

					for(let c of company.carousel) {
						if(i == 0) {
							data.push(image);
						} else {
							data.push(c);
						}
						i++;
					}

					company.carousel = data;
				} else if(op === "c2") {
					im = company.carousel[1] ? company.carousel[1] : null;

					data = [];
					i = 0;

					for(let c of company.carousel) {
						if(i == 1) {
							data.push(image);
						} else {
							data.push(c);
						}
						i++;
					}

					company.carousel = data;
				} else if(op === "c3") {
					im = company.carousel[2] ? company.carousel[2] : null;

					data = [];
					i = 0;

					for(let c of company.carousel) {
						if(i == 2) {
							data.push(image);
						} else {
							data.push(c);
						}
						i++;
					}

					company.carousel = data;
				} else {
					if(image) {
						try {
							fs.unlinkSync(`${__dirname}/uploads/${image}`);
						} catch(error) {
							return res.status(500).send(error);
						}
					}

					return res.status(400).send(lang["invOperation"]);
				}

				company.save().then((response) => {
					if(response) {
						if(im && (im != company.thumbnail)) {
							try {
								fs.unlinkSync(`${__dirname}/uploads/${im}`);
							} catch(error) {
								return res.status(200).send(lang["succUpdateButThumb"]);
							}
						}

						return res.status(200).send(lang["succUpdate"]);
					} else {
						if(im) {
							try {
								fs.unlinkSync(`${__dirname}/uploads/${im}`);
							} catch(error) {
								return res.status(500).send(error);
							}
						}

						return res.status(400).send(lang["failUpdate"]);
					}
				}).catch((error) => {
					if(im) {
						try {
							fs.unlinkSync(`${__dirname}/uploads/${im}`);
						} catch(e) {
							return res.status(500).send(e);
						}
					}

					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			if(im) {
				try {
					fs.unlinkSync(`${__dirname}/uploads/${im}`);
				} catch(e) {
					return res.status(500).send(e);
				}
			}

			return res.status(500).send(error);
		});
	},
	//	Update current user on database
	async updateUser(req, res) {
		const userId = req.headers.authorization;
		const { userUpdateId, type, password } = req.body;
		var errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		if(!userUpdateId || !userUpdateId.length || !mongoose.Types.ObjectId.isValid(userUpdateId)) {
			errors.push(lang["invId"]);
		}

		if(type < 0 || type > 2) {
			errors.push(lang["invUserType"]);
		}

		if(!password || !password.length) {
			errors.push(lang["invPassword"]);
		}

		if(userId === userUpdateId) {
			return res.status(400).send(lang["unauthOperation"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		let hash = "";
		await users.findById(userId).then((userAdmin) => {
			if(userAdmin) {
				hash = userAdmin.password;
			} else {
				return res.status(404).send(lang["nFUser"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});

		await users.findById(userUpdateId).then((user) => {
			if(user) {
				bcrypt.compare(password, hash).then((match) => {
					if(match) {
						if(type === user.userType) {
							return res.status(400).send(lang["invOperation"]);
						} else {
							user.userType = type;

							user.save().then((response) => {
								if(response) {
									return res.status(200).send(lang["succUpdate"]);
								} else {
									return res.status(400).send(lang["failUpdate"]);
								}
							}).catch((error) => {
								return res.status(500).send(error);
							});
						}
					} else {
						return res.status(400).send(lang["wrongPassword"]);
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
	//	Update opening hours
	async updateOpeningHours(req, res) {
		const { timetable } = req.body;
		var errors = [];

		if(!timetable || !timetable.length || timetable.length != 7) {
				errors.push(lang["invTimeTable"]);
		} else {
			for(const t of timetable) {
				if(!t.dayWeek || !t.dayWeek.length){
					errors.push(lang["invTimeTable"]);
					break;
				}

				if((t.beginHour && !t.endHour) || (!t.beginHour && t.endHour)
					|| (t.beginHour && !regEx.hour.test(t.beginHour))
					|| (t.endHour && !regEx.hour.test(t.endHour))
					|| ((t.endHour === t.beginHour) && t.endHour != null && t.beginHour != null)) {

					errors.push(lang["invTime"]);
					break;
				}
			}
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await companyData.findOneAndUpdate({}, {
			timetable: timetable
		}).then((response) => {
			if(response) {
				return res.status(200).send(lang["succUpdate"]);
			} else {
				return res.status(404).send(lang["nFCompanyInfo"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update cards
	async updateCards(req, res) {
		const { productTypes, cards } = req.body;
		var errors = [];

		if(!productTypes || !productTypes.length || !regEx.seq.test(productTypes)) {
			return res.status(400).send(lang["invCompanyProductTypes"]);
		}

		const typesP = productTypes.split(",").map(productType => productType.trim().toLowerCase());

		//	Validating cards fidelity
		if(!cards || !cards.length) {
			errors.push(lang["invCard"]);
		} else {
			for(const card of cards) {
				if(!card.type || !card.type.length){
					errors.push(lang["invCardType"]);
					break;
				}

				var invalid = true;
				for(const type of typesP) {
					if(type == card.type) {
						invalid = false;
						break;
					}
				}

				if(invalid) {
					errors.push(lang["invCardType"]);
					break;
				}

				if(card.available == null || typeof(card.available) != "boolean") {
					errors.push(lang["unavailableCard"]);
					break;
				}

				if(isNaN(card.qtdMax) || card.qtdMax < 10 || card.qtdMax > 20) {
					errors.push(lang["invCardQty"]);
					break;
				}

				if(isNaN(card.discount) || card.discount < 8 || card.discount > 20) {
					errors.push(lang["invCardDiscount"]);
					break;
				}

			}
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await companyData.findOneAndUpdate({}, {
			cards: cards
		}).then((response) => {
			if(response) {
				return res.status(200).send(lang["succUpdate"]);
			} else {
				return res.status(404).send(lang["nFCompanyInfo"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};