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
    const { name, type, qtd, method, discount, userId } = req.body;

    var errors = [];

		if(!name || !name.length) {
			errors.push("name");
    }

    await coupons.findOne({ name: name.trim() }).then((response) => {
			if(response) {
        return res.status(400).send("There is a coupon using this name, try another!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
		});

    if(!type || !type.length || (type != "qtd" && 
      type != "private" && type != "value" && type != "freigth")) {
			errors.push("type");
    }

    // TODO: testar cada id no vetor
    if(type === "private" && (!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId))) {
			errors.push("userId");
		}

    if(qtd < 0) {
			errors.push("qtd");
    }

    if(!method || !method.length || (method != "cash" && method != "percentage")) {
			errors.push("method");
    }

    if(discount < 0) {
			errors.push("discount");
    }

    if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
    }
    
    await coupons.create({
			name,
			type,
      qtd,
      method,
      discount,
      available: true,
      userId: (type === "private") ? userId : null
		}).then((response) => {
			if(response) {
				return res.status(201).send("Coupon created successfully!");
			} else {
        return res.status(400).send("We couldn't create a new coupon, try again later!");
			}
		}).catch((error) => {
      return res.status(500).send(error);	
		});
  },
  
  //	Update a specific coupon
  async update(req, res) {
    const couponId = req.params.id;
    const { name, type, qtd, method, discount, available, userId } = req.body;

    var errors = [];

		if(!name || !name.length) {
			errors.push("name");
    }

    await coupons.findOne({ name: name.trim() }).then((response) => {
			if(response) {
        return res.status(400).send("There is a coupon using this name, try another!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
		});

    if(!type || !type.length || (type != "qtd" && 
      type != "private" && type != "value" && type != "freigth")) {
			errors.push("type");
    }

    if(type === "private" && (!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId))) {
			errors.push("couponId");
		}

    if(qtd < 0) {
			errors.push("qtd");
    }

    if(!method || !method.length || (method != "cash" && method != "percentage")) {
			errors.push("method");
    }

    if(discount < 0) {
			errors.push("discount");
    }

    if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
    }

    await coupons.findById(couponId).then((coupon) => {
			if(coupon) {
        // TODO
        // fazer alterações
				coupon.save().then((response) => {
					if(response) {

						return res.status(200).send("Successful on changing your data!");
					} else {
						return res.status(400).send("We couldn't save your changes, try again later!");
					}
				}).catch((error) => {
					return res.status(500).send(error);
				});
			} else {
				return res.status(404).send("Coupon not found!" );
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});

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