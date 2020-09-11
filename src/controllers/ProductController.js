//  Loading database module
const mongoose = require("mongoose");

//	Loading ProductMenu schema and ProductsMenu collection from database
require("../models/ProductMenu");
const products = mongoose.model("ProductsMenu");

// Loading module to delete uploads
const fs = require("fs");

//	Defining regular expression to validations
const pricesRegEx = new RegExp(/^[0-9]+(\.[0-9]+)*(,\s?[0-9]+(\.?[0-9]+)*)*$/);
const seqRegExp = new RegExp(/^[a-zA-Z0-9\s\-.^~`´'\u00C0-\u024F\u1E00-\u1EFF]+(,\s?[a-zA-Z0-9\s\-.^~`´'\u00C0-\u024F\u1E00-\u1EFF]+)*$/);

//	Exporting Product Menu features
module.exports = {
	//	Return a product on database given id
	async index(req, res) {
		const productId = req.params.id;

		if(!productId || !productId.length) {
			return res.status(400).send("Invalid id!");
		}

		await products.findById(productId).then((product) => {
			if(product) {
				return res.status(200).json(product);
			} else {
				return res.status(400).send("Product not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new product for the menu
	async create(req, res) {
		const { name, ingredients, type, prices, sizes } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!name || !name.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid name!");
		}

		if(!type || !type.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid type!");
		}

		if(!prices || !prices.length || !pricesRegEx.test(prices)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid price(s)!");
		}

		if(!ingredients || !ingredients.length || !seqRegExp.test(ingredients)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid ingredients!");
		}

		if(!sizes || !sizes.length || !seqRegExp.test(sizes)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid size!");
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
		const { name, ingredients, type, prices, sizes } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!productId || !productId.length) {
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

		if(!type || !type.length) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid type!");
		}

		if(!prices || !prices.length || !pricesRegEx.test(prices)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid price(s)!");
		}

		if(!ingredients || !ingredients.length || !seqRegExp.test(ingredients)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid ingredients!");
		}

		if(!sizes || !sizes.length || !seqRegExp.test(sizes)) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Invalid size!");
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
			thumbnail: filename
		}).then((response) => {
			if(response) {
				try {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);
				} catch(error) {
					//
				}

				return res.status(200).send("The product has been updated!");
			} else {
				return res.status(400).send("Product not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Delete a specific product
	async delete(req, res) {
		const productId = req.params.id;

		if(!productId || !productId.length) {
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
				return res.status(400).send("Product not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Return all products
	async all(req, res) {
		await products.find().sort({
			type: "asc",
			name: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(400).send("Products not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};