//  Loading database module
const mongoose = require("mongoose");

//	Loading ProductMenu schema and ProductsMenu collection from database
require("../models/ProductMenu");
const products = mongoose.model("ProductsMenu");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const lang = require("../helpers/lang");

// Loading dirname
const path = require("path");
const dirname = path.resolve();

//	Exporting Product Menu features
module.exports = {
	//	Return a product on database given id
	async index(req, res) {
		const productId = req.params.id;

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send(lang.invId);
		}

		await products.findById(productId).then((product) => {
			if(product) {
				return res.status(200).json(product);
			} else {
				return res.status(404).send(lang.nFProduct);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new product for the menu
	async create(req, res) {
		const { name, ingredients, type, prices, sizes } = req.body;
		const filename = (req.file) ? req.file.filename : null;

		await products.create({
			name,
			ingredients: ingredients && ingredients.length ?
				ingredients.split(",").map((ing) => ing.trim().toLowerCase()) :
				null,
			sizes: sizes.split(",").map((s) => s.trim().toLowerCase()),
			type: type.trim().toLowerCase(),
			prices: prices.split(",").map((p) => parseFloat(p.trim())),
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
	//	Update a specific product
	async update(req, res) {
		const productId = req.params.id;
		const { name, ingredients, type, prices, sizes, available } = req.body;

		await products.findByIdAndUpdate(productId, {
			name,
			ingredients: ingredients && ingredients.length ?
				ingredients.split(",").map((ing) => ing.trim().toLowerCase())				:
				null,
			sizes: sizes.split(",").map((s) => s.trim().toLowerCase()),
			type: type.trim().toLowerCase(),
			prices: prices.split(",").map((p) => parseFloat(p.trim())),
			available
		}).then((response) => {
			if(response) {
				return res.status(200).send(lang.succUpdate);
			} else {
				return res.status(404).send(lang.nFProduct);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update a specific product thumbnail
	async updateThumbnail(req, res) {
		const productId = req.params.id;
		const filename = (req.file) ? req.file.filename : null;

		await products.findByIdAndUpdate(productId, {
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

				return res.status(404).send(lang.nFProduct);
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
	//	Delete a specific product
	async delete(req, res) {
		const productId = req.params.id;

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send(lang.invId);
		}

		await products.findByIdAndDelete(productId).then((response) => {
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
				return res.status(404).send(lang.nFProduct);
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
				return res.status(404).send(lang.nFProducts);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};
