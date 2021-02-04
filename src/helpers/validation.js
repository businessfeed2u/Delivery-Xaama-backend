//  Loading database module
const mongoose = require("mongoose");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");

//	Uploads folder path
const uploadsPath = `${__dirname}/../../uploads/`;

module.exports = {
	async createAddition(req, res, next) {
		const { name, type, price } = req.body;
		const filename = (req.file) ? req.file.filename : null;
    const errors = [];

    //	Checking if the upload is really an image
    if(filename) {
      const mimeType = (req.file.mimetype) ? req.file.mimetype.split("/")[0] : null;

      if(!mimeType || !mimeType.length || (mimeType != "image")) {
        errors.push(lang["invTypeImage"]);
      }
    }

		if(!name || !name.length) {
			errors.push(lang["invAdditionName"]);
		}

		if(!type || !type.length || !regEx.seq.test(type)) {
			errors.push(lang["invAdditionType"]);
		}

		if(!price || !price.length || !regEx.price.test(price)) {
			errors.push(lang["invAdditionPrice"]);
		}

		if(errors.length) {
			if(filename) {
				try {
					fs.unlinkSync(uploadsPath + filename);
				} catch(error) {
					return res.status(500).send(error);
				}
			}

			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateAddition(req, res, next) {
		const additionId = req.params.id;
		const { name, type, price, available } = req.body;
		const errors = [];

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			errors.push(lang["invId"]);
		}

		if(!name || !name.length) {
			errors.push(lang["invAdditionName"]);
		}

		if(!type || !type.length || !regEx.seq.test(type)) {
			errors.push(lang["invAdditionType"]);
		}

		if(!price || !regEx.price.test(price)) {
			errors.push(lang["invAdditionPrice"]);
		}

		if(available == null || available == undefined) {
			errors.push(lang["invAvailable"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateThumbnailAddition(req, res, next) {
		const additionId = req.params.id;
		const filename = (req.file) ? req.file.filename : null;
    const errors = [];

    //	Checking if the upload is really an image
    if(filename) {
      const mimeType = (req.file.mimetype) ? req.file.mimetype.split("/")[0] : null;

      if(!mimeType || !mimeType.length || (mimeType != "image")) {
        errors.push(lang["invTypeImage"]);
      }
    } else {
			errors.push(lang["invImage"]);
		}

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			errors.push(lang["invId"]);
		}

		if(errors.length) {
			if(filename) {
				try {
					fs.unlinkSync(uploadsPath + filename);
				} catch(error) {
					return res.status(500).send(error);
				}
			}

			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async createProduct(req, res, next) {
		const { name, ingredients, type, prices, sizes } = req.body;
		const filename = (req.file) ? req.file.filename : null;
    const errors = [];

    //	Checking if the upload is really an image
    if(filename) {
      const mimeType = (req.file.mimetype) ? req.file.mimetype.split("/")[0] : null;

      if(!mimeType || !mimeType.length || (mimeType != "image")) {
        errors.push(lang["invTypeImage"]);
      }
    }

		if(!name || !name.length) {
			errors.push(lang["invProductName"]);
		}

		if(ingredients && ingredients.length && !regEx.seq.test(ingredients)) {
			errors.push(lang["invProductIngredients"]);
		}

		if(!type || !type.length) {
			errors.push(lang["invProductType"]);
		}

		if(!prices || !prices.length || !regEx.prices.test(prices)) {
			errors.push(lang["invProductPrice"]);
		} else if(!sizes || !sizes.length || !regEx.seq.test(sizes)) {
			errors.push(lang["invProductSize"]);
		} else if(sizes.split(",").length !== prices.split(",").length) {
			errors.push(lang["invProductPriceSize"]);
		}

		if(errors.length) {
			if(filename) {
				try {
					fs.unlinkSync(uploadsPath + filename);
				} catch(error) {
					return res.status(500).send(error);
				}
			}

			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateProduct(req, res, next) {
		const productId = req.params.id;
		const { name, ingredients, type, prices, sizes, available } = req.body;
		const errors = [];

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			errors.push(lang["invId"]);
		}

		if(!name || !name.length) {
			errors.push(lang["invProductName"]);
		}

		if(ingredients && ingredients.length && !regEx.seq.test(ingredients)) {
			errors.push(lang["invProductIngredients"]);
		}

		if(!type || !type.length) {
			errors.push(lang["invProductType"]);
		}

		if(available == null || available == undefined) {
			errors.push(lang["invAvailable"]);
		}

		if(!prices || !prices.length || !regEx.prices.test(prices)) {
			errors.push(lang["invProductPrice"]);
		} else if(!sizes || !sizes.length || !regEx.seq.test(sizes)) {
			errors.push(lang["invProductSize"]);
		} else if(sizes.split(",").length !== prices.split(",").length) {
			errors.push(lang["invProductPriceSize"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateProductThumbnail(req, res, next) {
		const productId = req.params.id;
		const filename = (req.file) ? req.file.filename : null;
    const errors = [];

    //	Checking if the upload is really an image
    if(filename) {
      const mimeType = (req.file.mimetype) ? req.file.mimetype.split("/")[0] : null;

      if(!mimeType || !mimeType.length || (mimeType != "image")) {
        errors.push(lang["invTypeImage"]);
      }
    } else {
			errors.push(lang["invImage"]);
		}

		if(!productId || !productId.length || !mongoose.Types.ObjectId.isValid(productId)) {
			errors.push(lang["invId"]);
		}

		if(errors.length) {
			if(filename) {
				try {
					fs.unlinkSync(uploadsPath + filename);
				} catch(error) {
					return res.status(500).send(error);
				}
			}

			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	}
};