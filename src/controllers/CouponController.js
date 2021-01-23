//  Loading database module
const mongoose = require("mongoose");

//	Loading Coupon, User and Company schemas
require("../models/Coupon");
require("../models/User");
require("../models/Company");

//	Loading Coupons, Users and Companies collections from database
const coupons = mongoose.model("Coupons");
const users = mongoose.model("Users");
const companyData = mongoose.model("Company");

// Loading helpers
const lang = require("../helpers/lang");

//	Exporting Coupon features
module.exports = {
	//	Return all coupons available for user on database given user id
	async index(req, res) {
		const userId = req.headers.authorization;
		var errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		} else if(!(await users.findById(userId).exec())) {
			errors.push(lang["nFUser"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		const keysSearch = [
			{"$and": [ {"private": true}, {"userId": userId}, {"available": true} ] },
			{"$and": [ {"private": false}, {"available": true} ] },
		];

		const keysSearch2 = [
			{"$and": [ {"whoUsed.userId": userId}, {"whoUsed.status": false} ] },
			{"$and": [ {"whoUsed": []} ] },
		];

		const keysSearch3 = [
			{ "$or" : keysSearch },
			{ "$or" : keysSearch2 },
		];

		await coupons.find({ "$and" : keysSearch3 })
		.sort({
			type: "asc",
			available: "desc",
			name: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send(lang["nFCoupons"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new coupon
	async create(req, res) {
		const { name, type, private, qty, method, discount, minValue, userId } = req.body;
		var errors = [];

		if(!name || !name.length) {
			errors.push(lang["inv"]);
		}

		if(!type || !type.length || (type != "quantidade" && type != "valor" && type != "frete")) {
			errors.push(lang["invCouponType"]);
		}

		if(type === "frete" && method != "dinheiro") {
			errors.push(lang["invCouponTypeMethod"]);
		}

		if((type === "quantidade") && private) {
			errors.push(lang["invCouponTypeScope"]);
		}

		if(!method || !method.length || (method != "dinheiro" && method != "porcentagem")) {
			errors.push(lang["invCouponMethod"]);
		}

		if(private == null || private == undefined) {
			errors.push(lang["invCouponScope"]);
		}

		if(discount == null || discount == undefined || discount < 0 || discount > 100) {
			errors.push(lang["invCouponDiscount"]);
		}

		if(!private && userId && userId.length) {
			errors.push(lang["invCouponUserScope"]);
		}

		if(!private && (qty == null || qty == undefined || qty < 1)) {
			errors.push(lang["invCouponQty"]);
		}

		if(type === "frete") {
			const cFreight = await companyData.findOne({}).exec().freight;

			if(cFreight && cFreight != discount) {
				errors.push(lang["invCouponDiscount"]);
			} else {
				errors.push(lang["nFCompanyInfo"]);
			}
		}

		if(private) {
			if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
				errors.push(lang["invId"]);
			} else if(!(await users.findById(userId).exec())) {
				errors.push(lang["nFUser"]);
			}
		}

		if((type === "valor") && (minValue < 1)) {
			errors.push(lang["invCouponTypeMinValue"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await coupons.findOne({ name: name.trim() }).then((response) => {
			if(response) {
				return res.status(404).send(lang["existentCoupon"]);
			} else {
				coupons.create({
					name,
					type,
					private,
					qty : !private ? qty : 0,
					method,
					discount,
					minValue : (type === "valor") ? minValue : 0,
					userId: private && userId && userId.length ? userId : "",
				}).then((response) => {
					if(response) {
						return res.status(201).send(lang["succCreate"]);
					} else {
						return res.status(400).send(lang["failCreate"]);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update a specific coupon
	async update(req, res) {
		const couponId = req.params.id;
		const { name, type, private, qty, method, discount, minValue, userId, available } = req.body;
		var errors = [];

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
		}

		if(type === "frete" && method != "dinheiro") {
			errors.push(lang["invCouponTypeMethod"]);
		}

		if((type === "quantidade") && private) {
			errors.push(lang["invCouponTypeScope"]);
		}

		if(!method || !method.length || (method != "dinheiro" && method != "porcentagem")) {
			errors.push(lang["invCouponMethod"]);
		}

		if(private == null || private == undefined) {
			errors.push(lang["invCouponScope"]);
		}

		if(discount == null || discount == undefined || discount < 0 || discount > 100) {
			errors.push(lang["invCouponDiscount"]);
		}

		if(!private && userId && userId.length) {
			errors.push(lang["invCouponUserScope"]);
		}

		if(!private && (qty == null || qty == undefined || qty < 1)) {
			errors.push(lang["invCouponQty"]);
		}

		if(type === "frete") {
			const cFreight = await companyData.findOne({}).exec().freight;

			if(cFreight && cFreight != discount) {
				errors.push(lang["invCouponDiscount"]);
			} else {
				errors.push(lang["nFCompanyInfo"]);
			}
		}

		if(private) {
			if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
				errors.push(lang["invId"]);
			} else if(!(await users.findById(userId).exec())) {
				errors.push(lang["nFUser"]);
			}
		}

		if((type === "valor") && (minValue < 1)) {
			errors.push(lang["invCouponTypeMinValue"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await coupons.findOne({ name: name.trim() }).then((response) => {
			if(response && (response._id != couponId)) {
				return res.status(400).send(lang["existentCoupon"]);
			} else {
				coupons.findById(couponId).then((coupon) => {
					if(coupon) {
						coupon.name = name;
						coupon.type = type;
						coupon.qty = !private ? qty : 0,
						coupon.method = method;
						coupon.discount = discount;
						coupon.minValue = (type === "valor") ? minValue : 0,
						coupon.available = available;
						coupon.userId = private && userId && userId.length ? userId : "";
						coupon.private = private;
						coupon.whoUsed = [];

						coupon.save().then((response) => {
							if(response) {
								return res.status(200).send(lang["succUpdate"]);
							} else {
								return res.status(400).send(lang["failUpdate"]);
							}
						}).catch((error) => {
							return res.status(500).send(error);
						});
					} else {
						return res.status(404).send(lang["nFCoupon"]);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update a specific coupon of user
	async updateUser(req, res) {
		const couponId = req.params.id;
		const userId = req.headers.authorization;
		var errors = [];

		if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
			errors.push(lang["invId"]);
		}

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		} else if(!(await users.findById(userId).exec())) {
			errors.push(lang["nFUser"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		coupons.findById(couponId).then((coupon) => {
			if(coupon) {
				if(!coupon.available) {
					return res.status(400).send(lang["unavailableCoupon"]);
				}

				if(coupon.private && (coupon.userId != userId)) {
					return res.status(400).send(lang["invCouponUserScope"]);
				}

				var data = [];
				var v = false;

				for(var c of coupon.whoUsed) {
					if((c.userId === userId) && c.status) {
						return res.status(400).send(lang["unavailableCoupon"]);
					} else if(c.userId != userId) {
						data.push(c);
					} else {
						v = true;
					}
				}

				data.push({
					userId: userId,
					validated: true,
					status: false
				});

				if(!coupon.private) {
					if(!v) {
						coupon.qty = (coupon.qty > 0) ? (coupon.qty - 1) : 0;
					}

					coupon.available = (coupon.qty === 0) ? false : true;
				}

				coupon.whoUsed = data;

				coupon.save().then((response) => {
					if(response) {
						return res.status(200).send(lang["succUpdate"]);
					} else {
						return res.status(400).send(lang["failUpdate"]);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(404).send(lang["nFCoupon"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Delete a specific coupon
	async delete(req, res) {
		const couponId = req.params.id;

		if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
			return res.status(400).send(lang["invId"]);
		}

		await coupons.findByIdAndDelete(couponId).then((response) => {
			if(response) {
				return res.status(200).send(lang["succDelete"]);
			} else {
				return res.status(404).send(lang["nFCoupon"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Return all coupons
	async all(req, res) {
		await coupons.find().sort({
			type: "asc",
			available: "desc",
			name: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send(lang["nFCoupons"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};