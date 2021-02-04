//  Loading database module
const mongoose = require("mongoose");

//	Loading User and Company schemas
require("../models/Coupon");
require("../models/User");
require("../models/Company");

//	Loading Users and Company collections from database
const users = mongoose.model("Users");
const companyData = mongoose.model("Company");

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
	},
	async createCoupon(req, res, next) {
		const { name, type, private, qty, method, discount, minValue, userId } = req.body;
		const errors = [];

		if(!name || !name.length) {
			errors.push(lang["invCouponName"]);
		}

		if(!type || !type.length || (type != "quantidade" && type != "valor" && type != "frete")) {
			errors.push(lang["invCouponType"]);
		} else if(!method || !method.length || (method != "dinheiro" && method != "porcentagem")) {
			errors.push(lang["invCouponMethod"]);
		} else if(discount == null || discount == undefined || discount < 0 || discount > 100) {
			errors.push(lang["invCouponDiscount"]);
		} else if(private == null || private == undefined) {
			errors.push(lang["invCouponScope"]);
		} else if(type === "valor" && (minValue == null || minValue == undefined || minValue < 1)) {
			errors.push(lang["invCouponTypeMinValue"]);
		} else if(type === "frete") {
			if(method != "dinheiro") {
				errors.push(lang["invCouponTypeMethod"]);
			} else {
				const cFreight = (await companyData.findOne()).freight;

				if(!cFreight) {
					errors.push(lang["nFCompanyInfo"]);
				} else if(cFreight != discount) {
					errors.push(lang["invCouponDiscount"]);
				}
			}
		} else if(private) {
			if(type === "quantidade") {
				errors.push(lang["invCouponTypeScope"]);
			} else {
				if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
					errors.push(lang["invCouponUserScope"]);
				} else if(!(await users.findById(userId))) {
					errors.push(lang["nFUser"]);
				}
			}
		} else if(!private && (qty == null || qty == undefined || qty < 1)) {
			errors.push(lang["invCouponQty"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateCoupon(req, res, next) {
		const couponId = req.params.id;
		const { name, type, private, qty, method, discount, minValue, userId, available } = req.body;
		const errors = [];

		if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
			errors.push(lang["invId"]);
		}

		if(!name || !name.length) {
			errors.push(lang["invCouponName"]);
		}

		if(available == null || available == undefined) {
			errors.push(lang["invCouponAvailable"]);
		}

		if(!type || !type.length || (type != "quantidade" && type != "valor" && type != "frete")) {
			errors.push(lang["invCouponType"]);
		} else if(!method || !method.length || (method != "dinheiro" && method != "porcentagem")) {
			errors.push(lang["invCouponMethod"]);
		} else if(discount == null || discount == undefined || discount < 0 || discount > 100) {
			errors.push(lang["invCouponDiscount"]);
		} else if(private == null || private == undefined) {
			errors.push(lang["invCouponScope"]);
		} else if(type === "valor" && (minValue == null || minValue == undefined || minValue < 1)) {
			errors.push(lang["invCouponTypeMinValue"]);
		} else if(type === "frete") {
			if(method != "dinheiro") {
				errors.push(lang["invCouponTypeMethod"]);
			} else {
				const cFreight = (await companyData.findOne()).freight;

				if(!cFreight) {
					errors.push(lang["nFCompanyInfo"]);
				} else if(cFreight != discount) {
					errors.push(lang["invCouponDiscount"]);
				}
			}
		} else if(private) {
			if(type === "quantidade") {
				errors.push(lang["invCouponTypeScope"]);
			} else {
				if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
					errors.push(lang["invCouponUserScope"]);
				} else if(!(await users.findById(userId))) {
					errors.push(lang["nFUser"]);
				}
			}
		} else if(!private && (qty == null || qty == undefined || qty < 1)) {
			errors.push(lang["invCouponQty"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateUserCoupon(req, res, next) {
		const couponId = req.params.id;
		const userId = req.headers.authorization;
		const errors = [];

		if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
			errors.push(lang["invId"]);
		}

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		} else if(!(await users.findById(userId))) {
			errors.push(lang["nFUser"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async createRating(req, res, next) {
		const userId = req.headers.authorization;
		const { orderId, feedback, stars } = req.body;
		const errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		} else if(!(await users.findById(userId))) {
			errors.push(lang["nFUser"]);
		}

		if(!orderId || !orderId.length || !mongoose.Types.ObjectId.isValid(orderId)) {
			errors.push(lang["invId"]);
		}

		if(!feedback || !feedback.length) {
			errors.push(lang["invRatingFeedback"]);
		}

		if(!stars || stars < 0 || stars > 5) {
			errors.push(lang["invRatingStars"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async createUser(req, res, next) {
		const { name, email, password, passwordC } = req.body;
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

		if(!name || !name.length) {
			errors.push(lang["invUserName"]);
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push(lang["invEmail"]);
		}

		if(!password || !password.length || !regEx.password.test(password)) {
			errors.push(lang["invPassword"]);
		} else if(!passwordC || !passwordC.length || !regEx.password.test(passwordC)) {
			errors.push(lang["invPasswordConfirmation"]);
		} else if(password !== passwordC) {
			errors.push(lang["wrongPasswordConfirmation"]);
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
	async updateUser(req, res, next) {
		const userId = req.headers.authorization;
		const { name, email, address, phone, status } = req.body;
		const errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		if(!name || !name.length) {
			errors.push(lang["invUserName"]);
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push(lang["invEmail"]);
		}

		if(phone && phone.length && !regEx.phone.test(phone)) {
			errors.push(lang["invPhone"]);
		}

		if(address && address.length && !regEx.address.test(address)) {
			errors.push(lang["invAddress"]);
		}

		if(!status || !status.length) {
			errors.push(lang["invCardVector"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateUserThumbnail(req, res, next) {
		const userId = req.headers.authorization;
		const { delImg } = req.body;
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

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		if(!delImg || !delImg.length) {
			errors.push(lang["invUserDelImage"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateUserCard(req, res, next) {
		const userId = req.headers["order-user-id"];
		const { cardsNewQtd } = req.body;
		const errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		//	Validating fidelity cards
		if(!cardsNewQtd || !cardsNewQtd.length) {
			errors.push(lang["invCardQty"]);
		} else {
			const companyInfo = await companyData.findOne();

			if(!companyInfo) {
				errors.push(lang["nFCompanyInfo"]);
			} else if(cardsNewQtd.length != companyInfo.cards.length) {
				errors.push(lang["invCardQty"]);
			}
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	}
};