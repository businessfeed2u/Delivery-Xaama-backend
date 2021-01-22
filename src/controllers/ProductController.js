//  Loading database module
const mongoose = require("mongoose");

//	Loading ProductMenu schema and ProductsMenu collection from database
require("../models/ProductMenu");
const products = mongoose.model("ProductsMenu");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");

// Loading dirname
const path = require("path");
var __dirname = path.resolve();

//	Exporting Product Menu features
module.exports = {
	//	Return a product on database given id
	async index(req, res) {
		const productId = req.params.id;

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send(lang["invId"]);
		}

		await products.findById(productId).then((product) => {
			if(product) {
				return res.status(200).json(product);
			} else {
				return res.status(404).send(lang["nFProduct"]);
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
			errors.push(lang["invProductName"]);
		}

		if(!ingredients || !ingredients.length || !regEx.seq.test(ingredients)) {
			errors.push(lang["invProductIngredients"]);
		}

		if(!type || !type.length) {
			errors.push(lang["invProductType"]);
		}

		if(!prices || !prices.length || !regEx.prices.test(prices)) {
			errors.push(lang["invProductPrice"]);
		}

		if(!sizes || !sizes.length || !regEx.seq.test(sizes)) {
			errors.push(lang["invProductSize"]);
		}

		if(errors.length) {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(error) {
          return res.status(500).send(error);
        }
      }

			const message = errors.join(", ");

      return res.status(400).send(message);
		}

		if(sizes.split(",").length !== prices.split(",").length) {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(error) {
          return res.status(500).send(error);
        }
      }

      return res.status(400).send(lang["invProductPriceSize"]);
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
				return res.status(201).send(lang["succProductCreate"]);
			} else {
        if(filename) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${filename}`);
          } catch(error) {
            return res.status(500).send(error);
          }
        }
        return res.status(400).send(lang["failProductCreate"]);
			}
		}).catch((error) => {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
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

		var errors = [];

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			errors.push(lang["invId"]);
		}

		if(!name || !name.length) {
			errors.push(lang["invProductName"]);
		}

		if(!ingredients || !ingredients.length || !regEx.seq.test(ingredients)) {
			errors.push(lang["invProductIngredients"]);
		}

		if(!type || !type.length) {
			errors.push(lang["invProductType"]);
		}

		if(!prices || !prices.length || !regEx.prices.test(prices)) {
			errors.push(lang["invProductPrice"]);
		}

		if(!sizes || !sizes.length || !regEx.seq.test(sizes)) {
			errors.push(lang["invProductSize"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		if(sizes.split(",").length !== prices.split(",").length) {
			return res.status(400).send(lang["invProductPriceSize"]);
		}

		await products.findByIdAndUpdate(productId, {
			name,
			ingredients: ingredients.split(",").map(ing => ing.trim().toLowerCase()),
			sizes: sizes.split(",").map(s => s.trim().toLowerCase()),
			type: type.trim().toLowerCase(),
			prices: prices.split(",").map(p => parseFloat(p.trim())),
			available: available
		}).then((response) => {
			if(response) {
				return res.status(200).send(lang["succProductUpdate"]);
			} else {
				return res.status(404).send(lang["nFProduct"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Update a specific product
	async updateThumbnail(req, res) {
		const productId = req.params.id;
		const filename = (req.file) ? req.file.filename : null;

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send(lang["invId"]);
		}

		await products.findByIdAndUpdate(productId, {
			thumbnail: filename
		}).then((response) => {
			if(response) {
        if(response.thumbnail) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${response.thumbnail}`);
          } catch(error) {
            return res.status(200).send(lang["succProductUpdateButThumb"]);
          }
        }
        return res.status(200).send(lang["succProductUpdateThumb"]);
			} else {
        if(filename) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${filename}`);
          } catch(error) {
            return res.status(500).send(error);
          }
        }
        return res.status(404).send(lang["nFProduct"]);
			}
		}).catch((error) => {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
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
			return res.status(400).send(lang["invId"]);
		}

		await products.findByIdAndDelete(productId).then((response) => {
			if(response) {
        if(response.thumbnail) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${response.thumbnail}`);
          } catch(e){
            return res.status(200).send(lang["succProductDeleteButThumb"]);
          }
        }
        return res.status(200).send(lang["succProductDelete"]);
			} else {
				return res.status(404).send(lang["nFProduct"]);
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
				return res.status(404).send(lang["nFProducts"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};