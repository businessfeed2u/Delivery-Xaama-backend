//  Loading database module
const mongoose = require("mongoose");

//	Loading Addition schema and Additions collection from database
require("../models/Addition");
const additions = mongoose.model("Additions");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");

// Loading dirname
const path = require("path");
var __dirname = path.resolve();

//	Exporting Addition features
module.exports = {
	//	Return an addition on database given id
	async index(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			return res.status(400).send("Invalid id!");
		}

		await additions.findById(additionId).then((addition) => {
			if(addition) {
				return res.status(200).json(addition);
			} else {
				return res.status(404).send("Addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new addition
	async create(req, res) {
		const { name, type, price } = req.body;
		const filename = (req.file) ? req.file.filename : null;
		var errors = [];

		if(!name || !name.length) {
			errors.push("name");
		}

		if(!type || !type.length || !regEx.seq.test(type)) {
			errors.push("type");
		}

		if(!price || !price.length || !regEx.price.test(price)) {
			errors.push("price");
		}

		if(errors.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
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
		const { name, type, price, available } = req.body;
		const filename = (req.file) ? req.file.filename : null;
		var errors = [];

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			errors.push("id");
		}

		if(!name || !name.length) {
			errors.push("name");
		}

		if(!type || !type.length || !regEx.seq.test(type)) {
			errors.push("type");
		}

		if(!price || !price.length || !regEx.price.test(price)) {
			errors.push("price");
    }
    
    if(!available || !available.length || (available != "false" && available != "true")) {
      errors.push("Available is wrong!");
		}

		if(errors.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await additions.findByIdAndUpdate(additionId, {
			name,
			type: type.split(",").map(t => t.trim().toLowerCase()),
			price,
      thumbnail: filename,
      available: (available === "true")
		}).then((response) => {
			if(response) {
				if(response.thumbnail) {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);
				}

				return res.status(200).send("The addition has been updated!");
			} else {
				return res.status(404).send("Addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Delete a specific addition
	async delete(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
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
				return res.status(404).send("Addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Return all additions additions
	async all(req, res) {
		await additions.find().sort({
      type: "asc",
      available: "desc",
			name: "asc",
			price: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send("Additions not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};