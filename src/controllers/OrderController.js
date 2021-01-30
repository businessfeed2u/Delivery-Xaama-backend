//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading User, Orders, Company, ProductMenu, Addition and Coupon  collections from database
require("../models/Order");
require("../models/Company");
require("../models/User");
require("../models/ProductMenu");
require("../models/Addition");
require("../models/Coupon");

const orders = mongoose.model("Orders");
const users = mongoose.model("Users");
const productsMenu = mongoose.model("ProductsMenu");
const additions = mongoose.model("Additions");
const companyData = mongoose.model("Company");
const coupons = mongoose.model("Coupons");

// Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");
const date = require("../helpers/date");

const { findConnections, sendMessage } = require("../config/websocket");
const { systemOpen } = require("../helpers/systemOpen");

//	Exporting Order features
module.exports = {
	//	Return user orders
	async index(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send(lang["invId"]);
		}

		await orders.find({ "user._id": userId }).sort({
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
	},
	//	Create a new order
	async create(req, res) {
		const { user, products, deliver, address, typePayment, change, total, phone, couponId } = req.body;
		const sendSocketMessageTo = await findConnections();
		const errors = [], productsOrder = [];

		//	Validantig order user
		if(!user || !Object.keys(user).length || !(await users.findById(user._id))) {
      return res.status(400).send(lang["invId"]);
		}

		if(!(await users.findById(user._id))) {
			errors.push(lang["nFUser"]);
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
		}

		if(deliver == null) {
			errors.push(lang["invOrderDeliver"]);
		}

		if(isNaN(typePayment) || (typePayment != 0 && typePayment != 1)){
			errors.push(lang["invOrderPaymentMethod"]);
		}

		if(isNaN(total)) {
			errors.push(lang["invOrderTotal"]);
		}

		if((typePayment == 0) && (isNaN(change) || (change < total))) {
			errors.push(lang["invOrderChange"]);
		}

		if(deliver && (!address || !address.length || !regEx.address.test(address))) {
			errors.push(lang["invAddress"]);
		}

		if(!phone || !phone.length || !regEx.phone.test(phone)) {
			errors.push(lang["invPhone"]);
		}

		var company = null;
		await companyData.findOne({}).then((companyInfo) => {
			if(companyInfo) {
        company = companyInfo;
				if(companyInfo.manual && !companyInfo.systemOpenByAdm) {
					errors.push(lang["closedCompany"]);
				}
				else if(!companyInfo.manual && !systemOpen(company)) {
					errors.push(lang["closedCompany"]);
				}
			} else {
				errors.push(lang["nFCompanyInfo"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});

		//	Get freight price and add if deliver is true
		var totalB = (deliver) ? company.freight : 0.0;

		//	Calculate order total price
		for(var x of productsOrder) {
			if(x.size >= 0 && x.size < x.product.prices.length) {
				totalB += x.product.prices[x.size];
			} else {
				errors.push(x.product.name + " size doesn't exist!");
			}

			if(x.additions && x.additions.length) {
				for(var y of x.additions) {
						totalB += y.price;
				}
			}
		}

		//	Calculate order total price
		var myMapTypesProducts = new Map();

		if(productsOrder){
			for(x of productsOrder) {
				if(x.size >= 0 && x.size < x.product.prices.length) {
					myMapTypesProducts.set(x && x.product.type ? x.product.type : "",
						myMapTypesProducts.get(x.product.type) ? (myMapTypesProducts.get(x.product.type) + x.product.prices[x.size]) :
							x.product.prices[x.size]);
				}

				if(x.additions && x.additions.length) {
					for(y of x.additions) {
						myMapTypesProducts.set(x && x.product.type ? x.product.type : "",
							myMapTypesProducts.get(x.product.type) ? (myMapTypesProducts.get(x.product.type) + y.price) :
								y.price);
					}
				}
			}
		}

		// Calculate discount
		var d = 0;

		if(user && user.cards && company && company.cards){
			user.cards.map((card,index) => {
				card.completed && !card.status && myMapTypesProducts && myMapTypesProducts.get(card.cardFidelity) ?
					d = parseInt(d) + parseInt((company.cards[index].discount < myMapTypesProducts.get(card.cardFidelity) ?
						company.cards[index].discount : myMapTypesProducts.get(card.cardFidelity)))
						:
					null;
			});
		}

		//  Validating coupon if it exists and assigning the discount
		var discountCoupon = 0;
		var coupon = null;

		if(couponId && couponId.length) {
			if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
				return res.status(400).send(lang["invId"]);
			}

			coupon = await coupons.findById(couponId);

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
				} else {
					errors.push(lang["invCouponDiscount"]);
				}

			} else {
				errors.push(lang["invOrderCoupon"]);
			}
		}

		totalB = (totalB - d - discountCoupon) > 0 ? (totalB - d - discountCoupon) : 0 ;

		if((total != totalB)) {
			errors.push(lang["invOrderTotal"]);
		}

		if(errors.length) {
			const message = errors.join(", ");
			return res.status(400).send(message);
    }

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
		const { password } = req.headers;
		const userId = req.headers.authorization;
		const sendSocketMessageTo = await findConnections();
		var errors = [];

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