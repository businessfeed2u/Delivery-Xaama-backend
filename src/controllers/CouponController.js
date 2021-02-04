//  Loading database module
const mongoose = require("mongoose");

//	Loading Coupon, User and Company schemas
require("../models/Coupon");
require("../models/User");
require("../models/Company");

//	Loading Coupons, Users and Companies collections from database
const coupons = mongoose.model("Coupons");
const users = mongoose.model("Users");

// Loading helpers
const lang = require("../helpers/lang");

//	Exporting Coupon features
module.exports = {
	//	Return all coupons available for user on database given user id
	async index(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400)(lang["invId"]);
		} else if(!(await users.findById(userId))) {
			return res.status(400)(lang["nFUser"]);
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
	async updateUserCoupon(req, res) {
		const couponId = req.params.id;
		const userId = req.headers.authorization;

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