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
		const { user, hamburgers, pizzas } = req.body;

		if(!user) {
			return res.status(400).send("User is empty!");
		}

		var total = 0.0;

		//	Calculate hamburgers and additions total price if exists
		if(hamburgers) {
			for(var x of hamburgers) {
				for(var y of x.additions) {
					total += (x.hamburger.price + y.price);
				}
			}
		}

		//	Calculate pizzas and additions total price if exists
		if(pizzas) {
			for(x of pizzas) {
				for(y of x.additions) {
					if(x.size >= 0 && x.size < x.pizza.prices.length) {
						total += (x.pizza.prices[x.size] + y.price);
					} else {
						return res.status(400).send("Pizza size chosen doesn't exist! Try again");
					}
				}
			}
		}

		await orders.create({
			user,
			hamburgers,
			pizzas,
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