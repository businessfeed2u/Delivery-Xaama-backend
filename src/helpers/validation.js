//  Loading database module
const mongoose = require("mongoose");

//	Loading ProductMenu, Addition, Company, User and Company schemas and collections from database
require("../models/User");
require("../models/ProductMenu");
require("../models/Addition");
require("../models/Company");
require("../models/Coupon");

const users = mongoose.model("Users");
const companyData = mongoose.model("Company");
const productsMenu = mongoose.model("ProductsMenu");
const additions = mongoose.model("Additions");
const coupons = mongoose.model("Coupons");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");
const { systemOpen } = require("../helpers/systemOpen");

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

		const company = await companyData.findOne();
		if(!company) {
			errors.push(lang["nFCompanyInfo"]);
		} else {
			req.body.company = company;
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

		const company = await companyData.findOne();
		if(!company) {
			errors.push(lang["nFCompanyInfo"]);
		} else {
			req.body.company = company;

			//	Validating fidelity cards
			if(!cardsNewQtd || !cardsNewQtd.length) {
				errors.push(lang["invCardQty"]);
			} else if(cardsNewQtd.length != company.cards.length) {
				errors.push(lang["invCardQty"]);
			}
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateAllUsersCards(req, res, next) {
		const userId = req.headers.authorization;
		const errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		const company = await companyData.findOne();
		if(!company) {
			errors.push(lang["nFCompanyInfo"]);
		} else {
			req.body.company = company;
		}

		const allUsers = await users.find();
		if(!allUsers) {
			errors.push(lang["nFUsers"]);
		} else {
			req.body.allUsers = allUsers;
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateCompany(req, res, next) {
		const {
			name,
			email,
			phone,
			address,
			freight,
			productTypes,
			timeWithdrawal,
			timeDeliveryI,
			timeDeliveryF
		} = req.body;
		const errors = [];

		if(!name || !name.length) {
			errors.push(lang["invCompanyName"]);
		}

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push(lang["invEmail"]);
		}

		if(!phone || !phone.length || !regEx.phone.test(phone)) {
			errors.push(lang["invPhone"]);
		}

		if(!address || !address.length || !regEx.address.test(address)) {
			errors.push(lang["invAddress"]);
		}

		if(freight == null || freight == undefined || freight < 1 || freight > 10) {
			errors.push(lang["invCompanyFreight"]);
		}

		if(!productTypes || !productTypes.length || !regEx.seq.test(productTypes)) {
			errors.push(lang["invCompanyProductTypes"]);
		}

		if(timeWithdrawal < 10 || timeDeliveryI < 10 || timeDeliveryF < 10
		|| timeDeliveryI > timeDeliveryF || timeDeliveryI === timeDeliveryF) {
			errors.push(lang["invTime"]);
		}

		const company = await companyData.findOne();
		if(!company) {
			errors.push(lang["nFCompanyInfo"]);
		} else {
			req.body.company = company;
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateCompanyImage(req, res, next) {
		const { op } = req.body;
		const image = (req.file) ? req.file.filename : null;
		const errors = [];

    //	Checking if the upload is really an image
    if(image) {
      const mimeType = (req.file.mimetype) ? req.file.mimetype.split("/")[0] : null;

      if(!mimeType || !mimeType.length || (mimeType != "image")) {
        errors.push(lang["invTypeImage"]);
      }
    } else {
			errors.push(lang["invImage"]);
		}

		if(!op || !op.length) {
			errors.push(lang["invOperation"]);
		}

		if(errors.length) {
			if(image) {
				try {
					fs.unlinkSync(uploadsPath + image);
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
	async updateUserType(req, res, next) {
		const userId = req.headers.authorization;
		const { userUpdateId, type, password } = req.body;
		const errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		if(!userUpdateId || !userUpdateId.length || !mongoose.Types.ObjectId.isValid(userUpdateId)) {
			errors.push(lang["invId"]);
		}

		if(type == null || type == undefined || type < 0 || type > 2) {
			errors.push(lang["invUserType"]);
		}

		if(!password || !password.length) {
			errors.push(lang["invPassword"]);
		}

		if(userId === userUpdateId) {
			errors.push(lang["unauthOperation"]);
		}

		const hash = (await users.findById(userId)).password;
		if(!hash || hash.length) {
			errors.push(lang["invPassword"]);
		} else {
			req.body["hash"] = hash;
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateCompanyOpeningHours(req, res, next) {
		const { timetable } = req.body;
		const errors = [];

		if(!timetable || !timetable.length || timetable.length != 7) {
				errors.push(lang["invTimeTable"]);
		} else {
			for(const t of timetable) {
				if(!t.dayWeek || !t.dayWeek.length){
					errors.push(lang["invTimeTable"]);
					break;
				}

				if((t.beginHour && !t.endHour) || (!t.beginHour && t.endHour)
					|| (t.beginHour && !regEx.hour.test(t.beginHour))
					|| (t.endHour && !regEx.hour.test(t.endHour))
					|| ((t.endHour === t.beginHour) && t.endHour != null && t.beginHour != null)) {

					errors.push(lang["invTime"]);
					break;
				}
			}
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async updateCompanyCards(req, res, next) {
		const { productTypes, cards } = req.body;
		const errors = [];

		if(!productTypes || !productTypes.length || !regEx.seq.test(productTypes)) {
			return res.status(400).send(lang["invCompanyProductTypes"]);
		} else {
			const typesP = productTypes.split(",").map(pt => pt.trim().toLowerCase());

			//	Validating cards fidelity
			if(!cards || !cards.length) {
				errors.push(lang["invCard"]);
			} else {
				for(const card of cards) {
					if(!card.type || !card.type.length){
						errors.push(lang["invCardType"]);
						break;
					}

					var invalid = true;
					for(const type of typesP) {
						if(type == card.type) {
							invalid = false;
							break;
						}
					}

					if(invalid) {
						errors.push(lang["invCardType"]);
						break;
					}

					if(card.available == null || typeof(card.available) != "boolean") {
						errors.push(lang["unavailableCard"]);
						break;
					}

					if(isNaN(card.qtdMax) || card.qtdMax < 10 || card.qtdMax > 20) {
						errors.push(lang["invCardQty"]);
						break;
					}

					if(isNaN(card.discount) || card.discount < 8 || card.discount > 20) {
						errors.push(lang["invCardDiscount"]);
						break;
					}
				}
			}
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		} else {
			return next();
		}
	},
	async createOrder(req, res, next) {
		const userId = req.headers.authorization;
		const { products, deliver, address, typePayment, change, total, phone, couponId } = req.body;
		const errors = [], productsOrder = [];

		//	Validantig order user
		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send(lang["invId"]);
		}

		const user = await users.findById(userId);
		if(!user) {
			errors.push(lang["nFUser"]);
		} else {
			req.body["user"] = user;
		}

		//	Validating and checking if order products and their additions are available
		if(!products || !products.length) {
			errors.push(lang["invOrderProducts"]);
		} else {
			var invalid = false, available = true;

			for(const prod of products) {
				if(!mongoose.Types.ObjectId.isValid(prod.product)) {
					errors.push(lang["invOrderProducts"]);
					break;
				} else {
					const prodMenu = await productsMenu.findById(prod.product);

					if(prodMenu) {
						if(!prodMenu.available) {
							errors.push(lang["unavailableProduct"]);
							break;
						} else {
							const adds = [];

							for(const add of prod.additions) {
								if(!mongoose.Types.ObjectId.isValid(add)) {
									invalid = true;
									break;
								} else {
									const addMenu = await additions.findById(add);

									if(addMenu) {
										if(!addMenu.available) {
											available = false;
											break;
										}
										adds.push(addMenu);
									} else {
										invalid = true;
										break;
									}
								}
							}

							if(invalid) {
								errors.push(lang["invOrderProducts"]);
								break;
							} else if(!available) {
								errors.push(lang["unavailableAddition"]);
								break;
							} else {
								productsOrder.push({
									product : prodMenu,
									size : prod.size,
									additions : adds,
									note : prod.note
								});
							}
						}
					} else {
						errors.push(lang["invOrderProducts"]);
						break;
					}
				}
			}

			req.body["productsOrder"] = productsOrder;
		}

		if(deliver == null || deliver == undefined) {
			errors.push(lang["invOrderDeliver"]);
		} else if(deliver && (!address || !address.length || !regEx.address.test(address))) {
			errors.push(lang["invAddress"]);
		}

		if(isNaN(typePayment) || (typePayment != 0 && typePayment != 1)){
			errors.push(lang["invOrderPaymentMethod"]);
		} else if((typePayment == 0) && (isNaN(change) || (change < total))) {
			errors.push(lang["invOrderChange"]);
		}

		if(isNaN(total)) {
			errors.push(lang["invOrderTotal"]);
		}

		if(!phone || !phone.length || !regEx.phone.test(phone)) {
			errors.push(lang["invPhone"]);
		}

		const company = await companyData.findOne();
		if(!company) {
			errors.push(lang["nFCompanyInfo"]);
		} else if(company.manual && !company.systemOpenByAdm) {
			errors.push(lang["closedCompany"]);
		} else if(!company.manual && !systemOpen(company)) {
			errors.push(lang["closedCompany"]);
		}

		//	Get freight price and add if deliver is true
		var totalB = (deliver) ? company.freight : 0.0;

		//	Calculate order total price
		for(const x of productsOrder) {
			if(x.size >= 0 && x.size < x.product.prices.length) {
				totalB += x.product.prices[x.size];
			} else {
				errors.push(x.product.name + " size doesn't exist!");
			}

			if(x.additions && x.additions.length) {
				for(const y of x.additions) {
						totalB += y.price;
				}
			}
		}

		//	Calculate order total price
		var myMapTypesProducts = new Map();

		if(productsOrder){
			for(const x of productsOrder) {
				if(x.size >= 0 && x.size < x.product.prices.length) {
					myMapTypesProducts.set(x && x.product.type ? x.product.type : "",
						myMapTypesProducts.get(x.product.type) ? (myMapTypesProducts.get(x.product.type) + x.product.prices[x.size])
						:
						x.product.prices[x.size]
					);
				}

				if(x.additions && x.additions.length) {
					for(const y of x.additions) {
						myMapTypesProducts.set(x && x.product.type ? x.product.type : "",
							myMapTypesProducts.get(x.product.type) ? (myMapTypesProducts.get(x.product.type) + y.price)
							:
							y.price
						);
					}
				}
			}
		}

		// Calculate discount
		var discountCards = 0;
		if(user && user.cards && company && company.cards){
			user.cards.map((card,index) => {
				card.completed && !card.status && myMapTypesProducts && myMapTypesProducts.get(card.cardFidelity) ?
					discountCards = parseInt(discountCards) + parseInt((company.cards[index].discount < myMapTypesProducts.get(card.cardFidelity) ?
						company.cards[index].discount : myMapTypesProducts.get(card.cardFidelity)))
						:
						null;
			});
		}

		//  Validating coupon if it exists and assigning the discount
		var discountCoupon = 0;
		if(couponId && couponId.length) {
			if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
				return res.status(400).send(lang["invId"]);
			}

			const coupon = await coupons.findById(couponId);

			if(coupon) {
				if(coupon.private && (coupon.userId != user._id)) {
					errors.push(lang["invId"]);
				}

				if(coupon.type === "frete" && !deliver) {
					errors.push(lang["unavailableCoupon"]);
				}

				var priceProducts = deliver ? totalB - company.freight : totalB;

				if((coupon.type === "valor") && ( priceProducts < coupon.minValue)) {
					errors.push(lang["unavailableCoupon"]);
				}

				var applyDiscount = false;

				for(var c of coupon.whoUsed) {
					if((c.userId == user._id)){
						if((c.validated) && (!c.status)) {
							applyDiscount = true;
						}
					}
				}

				if(applyDiscount) {
					if(coupon.method === "porcentagem") {
						discountCoupon = (priceProducts * coupon.discount) / 100;
					} else {
						discountCoupon = coupon.discount;
					}

					req.body["coupon"] = coupon;
				} else {
					errors.push(lang["invCouponDiscount"]);
				}
			} else {
				errors.push(lang["invOrderCoupon"]);
			}
		}

		totalB = (totalB - discountCards - discountCoupon) > 0 ? (totalB - discountCards - discountCoupon) : 0 ;

		if((total != totalB)) {
			errors.push(lang["invOrderTotal"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
    } else {
			return next();
		}
	}
};