//  Loading database module
const mongoose = require("mongoose");

//	Loading Addition schema and Additions collection from database
require("../models/Addition");
const additions = mongoose.model("Additions");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const lang = require("../helpers/lang");

// Loading dirname
const path = require("path");
const dirname = path.resolve();

//	Exporting Addition features
module.exports = {
	//	Return an addition on database given id
	async index(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			return res.status(400).send(lang.invId);
		}

		await additions.findById(additionId).then((addition) => {
			if(addition) {
				return res.status(200).json(addition);
			} else {
				return res.status(404).send(lang.nFAddition);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new addition
	async create(req, res) {
		const { name, type, price } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		await additions.create({
			name,
			type: type.split(",").map((t) => t.trim().toLowerCase()),
			price,
			thumbnail: filename
		}).then((response) => {
			if(response) {
				return res.status(201).send(lang.succCreate);
			} else {
				if(filename) {
					try {
						fs.unlinkSync(`${dirname}/uploads/${filename}`);
					} catch(error) {
						return res.status(500).send(error);
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
	},
	//	Update a specific addition
	async update(req, res) {
		const additionId = req.params.id;
		const { name, type, price, available } = req.body;

		await additions.findByIdAndUpdate(additionId, {
			name,
			type: type.split(",").map((t) => t.trim().toLowerCase()),
			price,
			available
		}).then((response) => {
			if(response) {
				return res.status(200).send(lang.succUpdate);
			} else {
				return res.status(404).send(lang.nFAddition);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update a specific addition
	async updateThumbnail(req, res) {
		const additionId = req.params.id;
		const filename = (req.file) ? req.file.filename : null;

		await additions.findByIdAndUpdate(additionId, {
			thumbnail: filename
		}).then((response) => {
			if(response) {
				if(response.thumbnail) {
					try {
						fs.unlinkSync(`${dirname}/uploads/${response.thumbnail}`);
					} catch(error) {
						return res.status(200).send(lang.succUpdateButThumb);
					}
				}

				return res.status(200).send(lang.succUpdateThumb);
			} else {
				if(filename) {
					try {
						fs.unlinkSync(`${dirname}/uploads/${filename}`);
					} catch(error) {
						return res.status(500).send(error);
					}
				}

				return res.status(404).send(lang.nFAddition);
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
	//	Delete a specific addition
	async delete(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			return res.status(400).send(lang.invId);
		}

		await additions.findByIdAndDelete(additionId).then((response) => {
			if(response) {
				if(response.thumbnail) {
					try {
						fs.unlinkSync(`${dirname}/uploads/${response.thumbnail}`);
					} catch(e) {
						return res.status(200).send(lang.succDeleteButThumb);
					}
				}

				return res.status(200).send(lang.succDelete);
			} else {
				return res.status(404).send(lang.nFAddition);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Return all additions
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
				return res.status(404).send(lang.nFAdditions);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};
