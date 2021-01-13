//  Loading database module
const mongoose = require("mongoose");

//	Loading Coupon schema and Coupons collection from database
require("../models/Coupon");
const coupons = mongoose.model("Coupons");

//	Exporting Coupon features
module.exports = {
  //	Return an coupon on database given id
  async index(req, res) {
    const couponId = req.params.id;

		if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
			return res.status(400).send("Invalid id!");
		}

		await coupons.findById(couponId).then((coupon) => {
			if(coupon) {
				return res.status(200).json(coupon);
			} else {
				return res.status(404).send("Coupon not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },
  
  //	Create a new coupon
  async create(req, res) {

  },
  
  //	Update a specific coupon
  async update(req, res) {

  },
  
  //	Delete a specific coupon
  async delete(req, res) {
    const couponId = req.params.id;

		if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
			return res.status(400).send("Invalid id!");
		}

		await coupons.findByIdAndDelete(couponId).then((response) => {
			if(response) {
        return res.status(200).send("The coupon have been deleted!");
			} else {
				return res.status(404).send("Coupon not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },
  
  //	Return all coupons coupons
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
				return res.status(404).send("Coupons not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  }
	
};