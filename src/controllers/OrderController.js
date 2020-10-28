//  Loading database and bcryptjs modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//	Loading User, Orders and Company collections from database
require("../models/Order");
require("../models/Company");
require("../models/User");

const orders = mongoose.model("Orders");
const users = mongoose.model("Users");
const companyData = mongoose.model("Company");

// Loading helpers
const regEx = require("../helpers/regEx");

const { findConnections, sendMessage } = require("../config/websocket");
const { systemOpen } = require("../helpers/systemOpen");

//	Exporting Order features
module.exports = {
	//	Return an order on database given id
	async index(req, res) {
		const userId = req.params.id;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send("Invalid id!");
		}

		await orders.find({ "user._id": userId }).sort({
			status: "asc",
			creationDate: "asc"
		}).then((response) => {
			return res.status(200).json(response);
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new order
	async create(req, res) {
		const { user, products, deliver, address, typePayament, change, total, phone } = req.body;
		const sendSocketMessageTo = await findConnections();
    var errors = [];

		if(!user || !Object.keys(user).length) {
			errors.push("user");
		}

		if(!products || !products.length) {
			errors.push("products");
		}

		if(deliver == null) {
			errors.push("deliver");
		}

		if(deliver && (!address || !address.length)) {
			errors.push("delivery address");
    }

    if(isNaN(typePayament) || (typePayament != 0 && typePayament != 1)){
      errors.push("delivery typePayament");
    }

    if(isNaN(total)) {
      errors.push("delivery total");
    }

    //	Get freight price and add if deliver is true
		var totalB = await companyData.findOne({}).exec();
		totalB = (deliver) ? totalB.freight : 0.0;

		//	Calculate order total price
		for(var x of products) {
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

    if(total != totalB) {
      errors.push("delivery total");
    }

    if((typePayament == 0) && (isNaN(change) || (change < total))) {
      errors.push("delivery change");
    }

    if(address && address.length && !regEx.address.test(address)) {
			errors.push("address");
		}

    if(phone && phone.length && !regEx.phone.test(phone)) {
			errors.push("phone");
    }

    // Searching for a product or some addition of each product that is unavailable
    for(var product of products) {
      if(!product.product.available){
        errors.push("some added product is unavailable");
        break;
      }
      for(var addition of product.additions) {
        if(!addition.available){
          errors.push("some added addition is unavailable");
          break;
        }
      }
    }

    await companyData.findOne({}).then((companyInfo) => {
			if(companyInfo) {
				if(companyInfo.manual && !companyInfo.systemOpenByAdm) {
          errors.push("the company is closed");
        }
        else if(!companyInfo.manual && !systemOpen(companyInfo)) {
          errors.push("the company is closed");
        }
			} else {
				errors.push("no company data found");
			}
		}).catch((error) => {
			return res.status(500).send(error);
    });

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
		}

		await orders.create({
			user,
			products,
			total,
			deliver,
      address: deliver ? address.split(",").map(a => a.trim()) : null,
      phone,
      typePayament,
      change: (typePayament == 0) ? change : null
		}).then((response) => {
			if(response) {
        sendMessage(sendSocketMessageTo, "new-order", [response]);
				return res.status(201).json(response);
			} else {
				return res.status(400).send("We couldn't create a new order, try again later!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Update current order status
	async update(req, res) {
		const orderId = req.params.id;
		const { status, feedback } = req.body;
		const sendSocketMessageTo = await findConnections();

		if(!orderId || !orderId.length || !mongoose.Types.ObjectId.isValid(orderId)) {
			return res.status(400).send("No order received!");
		}

		if(typeof status != "boolean") {
			return res.status(400).send("Status is empty!");
		}

		await orders.findById(orderId).then((order) => {
			if(order) {
				order.status = status;
				order.feedback = feedback ? feedback.trim() : null ;

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

						return res.status(200).send("Successful on changing your data!");
					} else {
						return res.status(400).send("We couldn't save your changes, try again later!");
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(404).send("User not found!");
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
			errors.push("id");
		}

    if(!password || !password.length) {
			errors.push("password");
		}

		if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
    }

    async function deleteOrders() {
      await orders.deleteMany().then((response) => {
        if(response.n) {
          sendMessage(sendSocketMessageTo, "delete-order", []);
          return res.status(200).send("All orders have been deleted!");
        } else {
          return res.status(404).send("Orders not found!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    }

    await users.findById(userId).then((user) => {
			if(user) {
        bcrypt.compare(password, user.password).then((match) => {
          if(match) {
            deleteOrders();
          } else {
            return res.status(400).send("Wrong password, try again!");
          }
        });
			} else {
				return res.status(404).send("UserId not found!");
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
			return res.status(200).json(response);
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};