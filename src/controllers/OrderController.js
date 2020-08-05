//  Requiring database
const mongoose = require("mongoose");

//	Loading Orders collection from database
require("../models/Order");
const orders = mongoose.model("Orders");

//	Exporting Order features
module.exports = {
	//	Return an order on database given id
	async index(req, res) {
		const orderId = req.params.id;
		
		await orders.findOne({ _id: orderId }).then((order) => {
			if(order) {
				return res.status(200).json(order);
			} else {
				return res.status(400).send("Order not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Create a new order
	async create(req, res) {
		const { user, products } = req.body;

		if(!user || !products) {
			return res.status(400).send("User or products are empty!");
		}

		var total = 0.0;

		//	Calculate products and its additions total price if exists
		if(products) {
			for(var x of products) {
				for(var y of x.additions) {
					if(x.size >= 0 && x.size < x.product.prices.length) {
						total += (x.product.prices[x.size] + y.price);
					} else {
						return res.status(400).send(`${x.product.name} size doesn't exist!`);
					}
				}
			}
		}

		await orders.create({
			user,
			products,
			total
		}).then((response) => {
			if(response) {
				return res.status(201).send("Order created successfully!");
			} else {
				return res.status(400).send("We couldn't create a new order, try again later!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Delete a specific order
	async delete(req, res) {
		const orderId = req.params.id;

		await orders.findOneAndDelete({ _id: orderId }).then((response) => {
			if(response) {
				return res.status(200).send("The order has been deleted!");
			} else {
				return res.status(400).send("Order not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	
	//	Return all orders
	async allOrders(req, res) {
		await orders.find().sort({ 
			creationDate: "asc" 
		}).then((response) => {
			if(response && response.length ) {
				return res.status(200).json(response);
			} else {
				return res.status(400).send("Orders not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};