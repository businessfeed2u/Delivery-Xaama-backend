//  Requiring database
const mongoose = require("mongoose");

//	Loading ProductMenu schema and ProductsMenu collection from database
require("../models/ProductMenu");
const products = mongoose.model("ProductsMenu");

// Loading module to delete uploads
const fs = require("fs");

//	Exporting Product Menu features
module.exports = {
	//	Return a product on database given id
	async index(req, res) {
		const productId = req.params.id;
			
		await products.findOne({ _id: productId }).then((product) => {
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
		const { name, ingredients, type, prices } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!name || !name.length || !ingredients || !ingredients.length || !type || !type.length || !prices) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Name, ingredients, type or price are empty!");
		}

		await products.create({
			name,
			ingredients: ingredients.split(",").map(ingredient => ingredient.trim().toLowerCase()),
			type: type.trim().toLowerCase(),
			prices: prices.split(",").map(price => parseFloat(price.trim())),
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

		const { name, ingredients, type, prices } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		if(!name || !name.length || !ingredients || !ingredients.length || !type || !type.length || !prices) {
			if(filename) {
				fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
			}

			return res.status(400).send("Name, ingredients, type or price are empty!");
		}

		await products.findOneAndUpdate({ _id: productId }, {
			name,
			ingredients: ingredients.split(",").map(ingredient => ingredient.trim().toLowerCase()),
			type: type.trim().toLowerCase(),
			prices: prices.split(",").map(price => parseFloat(price.trim())),
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

		await products.findOneAndDelete({ _id: productId }).then((response) => {
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
	async allProducts(req, res) {
		await products.find().sort({ 
			name: "asc", 
			creationDate: "asc" 
		}).then((response) => {
			if(response && response.length ) {
				return res.status(200).json(response);
			} else {
				return res.status(400).send("Products not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};