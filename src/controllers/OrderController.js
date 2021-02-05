//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading User, Orders, Company, ProductMenu, Addition and Coupon schemas and collections from database
require("../models/Order");
require("../models/Company");
require("../models/User");
require("../models/Coupon");

const orders = mongoose.model("Orders");
const users = mongoose.model("Users");
const coupons = mongoose.model("Coupons");

// Loading helpers
const lang = require("../helpers/lang");
const date = require("../helpers/date");

const { findConnections, sendMessage } = require("../config/websocket");

//	Exporting Order features
module.exports = {
	//	Return user orders
	async index(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send(lang["invId"]);
		}

		await orders.find({ "user._id" : new mongoose.Types.ObjectId(userId) }).sort({
			status: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send(lang["nFOrders"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new order
	async create(req, res) {
		const { user, productsOrder, deliver, address, typePayment, change, total, phone, couponId, coupon } = req.body;
		const sendSocketMessageTo = await findConnections();

		await orders.create({
			user,
			products : productsOrder,
			total,
			deliver,
			address: deliver ? address.split(",").map(a => a.trim()) : null,
			phone,
			typePayment,
			change: (typePayment == 0) ? change : null,
			creationDate: date("weekDay") + " às " + date("hours") + ":" + date("minutes")
		}).then((order) => {
			if(order) {
				if(couponId && couponId.length) {
					if(coupon && coupon.private) {
						coupons.findByIdAndDelete(couponId).then((r) => {
							if(r) {
                sendMessage(sendSocketMessageTo, "new-order", [order]);
								return res.status(201).send(lang["succCreate"]);
							} else {
								return res.status(404).send(lang["nFCoupon"]);
							}
						}).catch((error) => {
							return res.status(500).send(error);
						});
					} else {
						coupons.findById(couponId).then((coupon) => {
							if(coupon) {
								var d = [];

								for(var c of coupon.whoUsed) {
									if((c.userId === user._id)){
										d.push({
											userId: user._id,
											validated: true,
											status: true
										});
									} else {
										d.push(c);
									}
								}

								coupon.whoUsed = d;

								coupon.save().then((c) => {
									if(c) {
                    sendMessage(sendSocketMessageTo, "new-order", [order]);
										return res.status(201).send(lang["succCreate"]);
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
				} else {
					sendMessage(sendSocketMessageTo, "new-order", [order]);
					return res.status(201).send(lang["succCreate"]);
				}
			} else {
				return res.status(400).send(lang["failCreate"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update current order status
	async update(req, res) {
		const orderId = req.params.id;
		const { status } = req.body;
		const sendSocketMessageTo = await findConnections();

		if(!orderId || !orderId.length || !mongoose.Types.ObjectId.isValid(orderId)) {
			return res.status(400).send(lang["invId"]);
		}

		if(status === null || status === undefined) {
			return res.status(400).send(lang["invOrderStatus"]);
		}

		await orders.findById(orderId).then((order) => {
			if(order) {
				order.status = status;

				order.save().then((response) => {
					if(response) {
						orders.find().sort({
							status: "asc",
							creationDate: "desc"
						}).then((response) => {
							sendMessage(sendSocketMessageTo, "update-order", response);
						}).catch((error) => {
							return res.status(500).send(error);
						});

						return res.status(200).send(lang["succUpdate"]);
					} else {
						return res.status(400).send(lang["failUpdate"]);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(404).send(lang["nFOrder"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Delete all orders
	async delete(req, res) {
		const userId = req.headers.authorization;
		const { password } = req.headers;
		const sendSocketMessageTo = await findConnections();
		const errors = [];

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			errors.push(lang["invId"]);
		}

		if(!password || !password.length) {
			errors.push(lang["invPassword"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				bcrypt.compare(password, user.password).then((match) => {
					if(match) {
						orders.deleteMany({status : true}).then((response) => {
              if(response.n) {
                orders.find().sort({
                  status: "asc",
                  creationDate: "asc"
                }).then((response) => {
                  if(response) {
                    sendMessage(sendSocketMessageTo, "delete-order", response);
                    return res.status(200).send(lang["succAllDelete"]);
                  } else {
                    return res.status(200).send(lang["succAllDelete"]);
                  }
                }).catch((error) => {
                  return res.status(500).send(error);
                });
              } else {
                return res.status(404).send(lang["nFOrders"]);
              }
            }).catch((error) => {
              return res.status(500).send(error);
            });
					} else {
						return res.status(400).send(lang["wrongPassword"]);
					}
				});
			} else {
				return res.status(404).send(lang["nFUser"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Return all orders
	async all(req, res) {
		await orders.find().sort({
			status: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send(lang["nFOrders"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};