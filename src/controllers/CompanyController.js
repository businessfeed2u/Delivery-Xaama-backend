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

//	Exporting Admin features
module.exports = {
	//	Return product types on database
	async productTypes(req, res) {
		await companyData.findOne({}).then((response) => {
			if(response) {
				return res.status(200).json(response.productTypes);
			} else {
				return res.status(404).send("Product types not found!");
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
				return res.status(400).send("No company data found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create or update company data
	async manageCompanyData(req, res) {
		const { name, email, phone, address, freight, productTypes, manual, systemOpenByAdm,
						timeWithdrawal, timeDeliveryI, timeDeliveryF } = req.body;
		const images = req.files;
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

		if(address && address.length && !regEx.address.test(address)) {
			errors.push("address");
		}

		if(!freight || !freight.length) {
			errors.push("freight");
		}

		if(!productTypes || !productTypes.length || !regEx.seq.test(productTypes)) {
			errors.push("product type(s)");
		}

		if(!manual || !manual.length || (manual != "false" && manual != "true")) {
			errors.push("manual is wrong!");
		}

		if(!systemOpenByAdm || !systemOpenByAdm.length || (systemOpenByAdm != "false" && systemOpenByAdm != "true")) {
			errors.push("systemOpenByAdm is wrong!");
		}

		if(!timeWithdrawal || !timeWithdrawal.length) {
				errors.push("timeWithdrawal");
		}

		if(!timeDeliveryI || !timeDeliveryI.length) {
				errors.push("timeDeliveryI");
		}

		if(!timeDeliveryF || !timeDeliveryF.length) {
				errors.push("timeDeliveryF");
		}

		const tWithdrawal = parseInt(timeWithdrawal);
		const tDeliveryI = parseInt(timeDeliveryI);
		const tDeliveryF = parseInt(timeDeliveryF);

		if(tWithdrawal < 10 || tDeliveryI < 10 || tDeliveryF < 10
		|| tDeliveryI > tDeliveryF || tDeliveryI === tDeliveryF) {
				errors.push("timeDelivery or timeWithdrawal");
		}

		if(errors.length) {
			if(images) {
				for(const im of images)
					fs.unlinkSync(`${__dirname}/../../uploads/${im.filename}`);
			}

			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await companyData.findOneAndUpdate({}, {
			name,
			email,
			phone,
			address,
			freight,
			productTypes: productTypes.split(",").map(productType => productType.trim().toLowerCase()),
			logo: images[0] ? images[0].filename : null,
			carousel: [
				images[1] ? images[1].filename : null,
				images[2] ? images[2].filename : null,
				images[3] ? images[3].filename : null
			],
			manual: (manual === "true"),
			systemOpenByAdm: (systemOpenByAdm === "true"),
			timeWithdrawal: tWithdrawal,
			timeDeliveryI: tDeliveryI,
			timeDeliveryF: tDeliveryF
		}).then((response) => {
			if(response) {
				try {
					for(const im of response.carousel)
						fs.unlinkSync(`${__dirname}/../../uploads/${im}`);
				} catch(error) {
					//
				}
				try {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.logo}`);
				} catch(error) {
					//
				}

				return res.status(200).send("The company data has been updated!");
			} else {
				companyData.create({
					name,
					email,
					phone,
					address,
					freight,
					productTypes: productTypes.split(",").map(productType => productType.trim().toLowerCase()),
					logo: images[0] ? images[0].filename : null,
					carousel: [
						images[1] ? images[1].filename : null,
						images[2] ? images[2].filename : null,
						images[3] ? images[3].filename : null
					],
					manual: (manual === "true"),
					systemOpenByAdm: (systemOpenByAdm === "true"),
				}).then((company) => {
					if(company) {
						return res.status(201).json(company);
					} else {
						if(images) {
							for(const im of images)
								fs.unlinkSync(`${__dirname}/../../uploads/${im.filename}`);
						}

						return res.status(400).send("We couldn't process your request, try again later!");
					}
				}).catch((error) => {
					if(images) {
						for(const im of images)
							fs.unlinkSync(`${__dirname}/../../uploads/${im.filename}`);
					}

					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			if(images) {
				for(const im of images)
					fs.unlinkSync(`${__dirname}/../../uploads/${im.filename}`);
			}

			return res.status(500).send(error);
		});
  },

	//	Update current user on database
	async update(req, res) {
		const userId = req.headers.authorization;
		const { userUpdateId, type, password } = req.body;
		var errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push("admin id");
		}

		if(!userUpdateId || !userUpdateId.length || !mongoose.Types.ObjectId.isValid(userUpdateId)) {
			errors.push("user id");
		}

		if(type < 0 || type > 2) {
			errors.push("user type");
		}

		if(!password || !password.length) {
			errors.push("password");
		}

		if(userId === userUpdateId) {
			return res.status(400).send("Aborted! You can't lower yourself!");
		}

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		let hash = "";
		await users.findById(userId).then((userAdmin) => {
			hash = userAdmin.password;
		}).catch((error) => {
			return res.status(500).send(error);
		});

		await users.findById(userUpdateId).then((user) => {
			if(user) {
				bcrypt.compare(password, hash).then((match) => {
					if(match) {
						if(type === user.userType) {
							return res.status(400).send("Aborted! The user is already of that type requested!");
						} else {
							user.userType = type;

							user.save().then((response) => {
								if(response) {
									return res.status(200).send("Successful on changing your data!");
								} else {
									return res.status(400).send("We couldn't save your changes, try again later!");
								}
							}).catch((error) => {
								return res.status(500).send(error);
							});
						}
					} else {
						return res.status(400).send("Password don't match, try again!");
					}
				}).catch((error) => {
					return res.status(500).send(error.message);
				});
			} else {
				return res.status(404).send("User not found!");
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
			errors.push("timetable");
	} else {
		for(const t of timetable) {
			if(!t.dayWeek || !t.dayWeek.length){
				errors.push("timetable day week");
				break;
			}

			if((t.beginHour && !t.endHour) || (!t.beginHour && t.endHour)
				|| (t.beginHour && !regEx.hour.test(t.beginHour))
				|| (t.endHour && !regEx.hour.test(t.endHour))
				|| ((t.endHour === t.beginHour) && t.endHour != null && t.beginHour != null)) {

				errors.push("time format");
				break;
			}
		}
	}

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await companyData.findOneAndUpdate({}, {
			timetable: timetable
		}).then((response) => {
			if(response) {
				return res.status(200).send("The company data has been updated!");
			} else {
				return res.status(400).send("There is no company!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  }
};