//  Loading database module
const mongoose = require("mongoose");

//	Loading ProductMenu schema and ProductsMenu collection from database
require("../models/ProductMenu");
const products = mongoose.model("ProductsMenu");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");

// Loading dirname
const path = require("path");
var __dirname = path.resolve();

//	Exporting Product Menu features
module.exports = {
	//	Return a product on database given id
	async index(req, res) {
		const productId = req.params.id;

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send("Invalid id!");
		}

		await products.findById(productId).then((product) => {
			if(product) {
				return res.status(200).json(product);
			} else {
				return res.status(404).send("Product not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new product for the menu
	async create(req, res) {
		const { name, ingredients, type, prices, sizes } = req.body;
		const filename = (req.file) ? req.file.filename : null;
		var errors = [];

		if(!name || !name.length) {
			errors.push("name");
		}

		if(!ingredients || !ingredients.length || !regEx.seq.test(ingredients)) {
			errors.push("ingredients");
		}

		if(!type || !type.length) {
			errors.push("type");
		}

		if(!prices || !prices.length || !regEx.prices.test(prices)) {
			errors.push("price(s)");
		}

		if(!sizes || !sizes.length || !regEx.seq.test(sizes)) {
			errors.push("size(s)");
		}

		if(errors.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		if(sizes.split(",").length !== prices.split(",").length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Prices and sizes don't have the same length!");
		}

		await products.create({
			name,
			ingredients: ingredients.split(",").map(ing => ing.trim().toLowerCase()),
			sizes: sizes.split(",").map(s => s.trim().toLowerCase()),
			type: type.trim().toLowerCase(),
			prices: prices.split(",").map(p => parseFloat(p.trim())),
			thumbnail: filename
		}).then((response) => {
			if(response) {
				return res.status(201).send("Product created successfully!");
			} else {
				if(filename) {
					fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
				}

				return res.status(400).send("We couldn't create a new product, try again later!");
			}
		}).catch((error) => {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(500).send(error);
		});
	},

	//	Update a specific product
	async update(req, res) {
		const productId = req.params.id;
		const { name, ingredients, type, prices, sizes, available } = req.body;
		const filename = (req.file) ? req.file.filename : null;
    var errors = [];
  
		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			errors.push("id");
		}

		if(!name || !name.length) {
			errors.push("name");
		}

		if(!ingredients || !ingredients.length || !regEx.seq.test(ingredients)) {
			errors.push("ingredients");
		}

		if(!type || !type.length) {
			errors.push("type");
		}

		if(!prices || !prices.length || !regEx.prices.test(prices)) {
			errors.push("price(s)");
		}

		if(!sizes || !sizes.length || !regEx.seq.test(sizes)) {
			errors.push("size(s)");
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

		if(sizes.split(",").length !== prices.split(",").length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Prices and sizes don't have the same length!");
    }

		await products.findByIdAndUpdate(productId, {
			name,
			ingredients: ingredients.split(",").map(ing => ing.trim().toLowerCase()),
			sizes: sizes.split(",").map(s => s.trim().toLowerCase()),
			type: type.trim().toLowerCase(),
			prices: prices.split(",").map(p => parseFloat(p.trim())),
      thumbnail: filename,
      available: (available === "true")
		}).then((response) => {
			if(response) {
				try {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);
				} catch(error) {
					//
				}

				return res.status(200).send("The product has been updated!");
			} else {
				return res.status(404).send("Product not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Delete a specific product
	async delete(req, res) {
		const productId = req.params.id;

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send("Invalid id!");
		}

		await products.findByIdAndDelete(productId).then((response) => {
			if(response) {
				try {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);

					return res.status(200).send("The product and its thumbnail have been deleted!");
				} catch(e){
					return res.status(200).send("The product was deleted, but the thumbnail was not found");
				}
			} else {
				return res.status(404).send("Product not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Return all products
	async all(req, res) {
		await products.find().sort({
      type: "asc",
      available: "desc",
			name: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send("Products not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};