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
const lang = require("../helpers/lang");

// Loading dirname
const path = require("path");
var __dirname = path.resolve();

//	Exporting Admin features
module.exports = {
	//	Return product types on database
	async productTypes(req, res) {
		await companyData.findOne().then((response) => {
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
		await companyData.findOne().then((response) => {
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
			timeDeliveryF,
			company
		} = req.body;
		const typesP = productTypes.split(",").map(pt => pt.trim().toLowerCase());
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
		var im = null;
		var data = [];
		var i = 0;

		await companyData.findOne().then((company) => {
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
	async updateUserType(req, res) {
		const { userUpdateId, type, password, hash } = req.body;

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
		const { cards } = req.body;

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