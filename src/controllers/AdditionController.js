//  Loading database module
const mongoose = require("mongoose");

//	Loading Addition schema and Additions collection from database
require("../models/Addition");
const additions = mongoose.model("Additions");

// Loading module to delete uploads
const fs = require("fs");

//	Exporting Addition features
module.exports = {
	//	Return an addition on database given id
	async index(req, res) {
		const additionId = req.params.id;
		
		await additions.findOne({ _id: additionId }).then((addition) => {
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

		if(!name || !name.length || !type || !price) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Name, type or price are empty!");
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

		if(!name || !name.length || !type || !price) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Name, type or price are empty!");
		}

		await additions.findOneAndUpdate({ _id: additionId }, {
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

		await additions.findOneAndDelete({ _id: additionId }).then((response) => {
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