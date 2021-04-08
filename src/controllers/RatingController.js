//  Loading database and bcryptjs modules
const mongoose = require("mongoose");

//	Loading Rating, Order and User schemas
require("../models/Rating");
require("../models/User");
require("../models/Order");

//	Loading Ratings, Orders and Users collections from database
const ratings = mongoose.model("Ratings");
const orders = mongoose.model("Orders");

// Loading helpers
const lang = require("../helpers/lang");

//	Exporting Rating features
module.exports = {
	//	Return all rating
	async create(req, res) {
		const userId = req.headers.authorization;
		const { orderId, feedback, stars } = req.body;

		const keysSearch = {$and: [ {userId}, {orderId} ] };

		await orders.findById(orderId).then((order) => {
			if(order) {
				if(order.user._id == userId) {
					ratings.find(keysSearch)
						.then((response) => {
							if(response && response.length) {
								return res.status(403).send(lang.unauthOperation);
							} else {
								ratings.create({
									userId,
									orderId,
									feedback,
									stars,
									name: order.user.name ? order.user.name : "",
									thumbnail: order.user.thumbnail ? order.user.thumbnail : null
								}).then((rating) => {
									if(rating) {
										order.feedback = true;
										order.save().then((response) => {
											if(response) {
												return res.status(201).json(rating);
											} else {
												return res.status(400).send(lang.failCreate);
											}
										}).catch((error) => {
											return res.status(500).send(error);
										});
									} else {
										return res.status(400).send(lang.failCreate);
									}
								}).catch((error) => {
									return res.status(500).send(error);
								});
							}
						}).catch((error) => {
							return res.status(500).send(error);
						});
				} else {
					return res.status(403).send(lang.unauthOperation);
				}
			} else {
				return res.status(404).send(lang.nFOrder);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	// Update current rating on database
	async update(req, res) {
		const ratingId = req.params.id;

		if(!ratingId || !ratingId.length || !mongoose.Types.ObjectId.isValid(ratingId)) {
			return res.status(400).send(lang.invId);
		}

		await ratings.findById(ratingId).then((response) => {
			if(response.approved) {
				return res.status(400).send(lang.approvedRating);
			} else {
				response.approved = true;
				response.save().then((response) => {
					if(response) {
						return res.status(200).send(lang.succUpdate);
					} else {
						return res.status(404).send(lang.nFRating);
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Delete rating
	async delete(req, res) {
		const ratingId = req.params.id;

		if(!ratingId || !ratingId.length || !mongoose.Types.ObjectId.isValid(ratingId)) {
			return res.status(400).send(lang.invId);
		}

		await ratings.findByIdAndDelete(ratingId).then((response) => {
			if(response) {
				return res.status(200).send(lang.succDelete);
			} else {
				return res.status(404).send(lang.nFRating);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Return all rating
	async all(req, res) {
		await ratings.find().sort({
			approved: "asc",
			stars: "desc",
			name: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(404).json(lang.nFRatings);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};
