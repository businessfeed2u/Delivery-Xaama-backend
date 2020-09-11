//  Loading database module
const mongoose = require("mongoose");

//	Loading Addition schema and Additions collection from database
require("../models/Addition");
const additions = mongoose.model("Additions");

// Loading module to delete uploads
const fs = require("fs");

//	Defining regular expression to validations
const typeRegEx = new RegExp(/^[a-zA-Z0-9\s\-.^~`´'\u00C0-\u024F\u1E00-\u1EFF]+(,\s?[a-zA-Z0-9\s\-.^~`´'\u00C0-\u024F\u1E00-\u1EFF]+)*$/);
const priceRegEx = new RegExp(/^[0-9]+(\.[0-9]+)*$/);

//	Exporting Addition features
module.exports = {
	//	Return an addition on database given id
	async index(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length) {
			return res.status(400).send("Invalid id!");
		}

		await additions.findById(additionId).then((addition) => {
			if(addition) {
				return res.status(200).json(addition);
			} else {
				return res.status(400).send("Addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new addition
	async create(req, res) {
		const { name, type, price } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!name || !name.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid name!");
		}

		if(!type || !type.length || !typeRegEx.test(type)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid type!");
		}

		if(!price || !price.length || !priceRegEx.test(price)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid price!");
		}

		await additions.create({
			name,
			type: type.split(",").map(t => t.trim().toLowerCase()),
			price,
			thumbnail: filename
		}).then((response) => {
			if(response) {
				return res.status(201).send("Addition created successfully!");
			} else {
				if(filename) {
					fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
				}

				return res.status(400).send("We couldn't create a new addition, try again later!");
			}
		}).catch((error) => {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(500).send(error);
		});
	},

	//	Update a specific addition
	async update(req, res) {
		const additionId = req.params.id;
		const { name, type, price } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!additionId || !additionId.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid id!");
		}

		if(!name || !name.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid name!");
		}

		if(!type || !type.length || !typeRegEx.test(type)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid type!");
		}

		if(!price || !price.length || !priceRegEx.test(price)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid price!");
		}

		await additions.findByIdAndUpdate(additionId, {
			name,
			type: type.split(",").map(t => t.trim().toLowerCase()),
			price,
			thumbnail: filename
		}).then((response) => {
			if(response) {
				if(response.thumbnail) {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);
				}

				return res.status(200).send("The addition has been updated!");
			} else {
				return res.status(400).send("Addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Delete a specific addition
	async delete(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length) {
			return res.status(400).send("Invalid id!");
		}

		await additions.findByIdAndDelete(additionId).then((response) => {
			if(response) {
				try {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);

					return res.status(200).send("The addition and its thumbnail have been deleted!");
				} catch(e){
					return res.status(200).send("The addition have been deleted, but the thumbnail was not found");
				}
			} else {
				return res.status(400).send("Addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Return all additions additions
	async all(req, res) {
		await additions.find().sort({
			type: "asc",
			name: "asc",
			price: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(400).send("Additions not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};