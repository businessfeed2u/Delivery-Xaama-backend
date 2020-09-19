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
		const { name, email, phone, address, freight, productTypes } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!name || !name.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid name!");
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid email!");
		}

		if(!phone || !phone.length || !regEx.phone.test(phone)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid phone!");
		}

		if(address && address.length && !regEx.address.test(address)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid address!");
		}

		if(!freight || !freight.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid freight!");
		}

		if(!productTypes || !productTypes.length || !regEx.seq.test(productTypes)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid product type(s)!");
		}

		await companyData.findOneAndUpdate({}, {
			name,
			email,
			phone,
			address,
			freight,
			productTypes: productTypes.split(",").map(productType => productType.trim().toLowerCase()),
			logo: filename
		}).then((response) => {
			if(response) {
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
					logo: filename
				}).then((company) => {
					if(company) {
						return res.status(201).json(company);
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
		const { userUpdateId, type, password } = req.body;

		if(!userId || !userId.length || !userUpdateId || !userUpdateId.length) {
			return res.status(400).send("No user is logged in or no has user to update!");
		}

		if(userId === userUpdateId) {
			return res.status(400).send("Aborted! You can't lower yourself!");
		}

		if(!password || !password.length) {
			return res.status(400).send("Password is empty!");
		}

		if(type < 0 || type > 2) {
			return res.status(400).send("User type invalid!");
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
	}
};