//  Loading database module
const mongoose = require("mongoose");

//	Loading Coupon and User collections from database
require("../models/Coupon");
require("../models/User");

const coupons = mongoose.model("Coupons");
const users = mongoose.model("Users");

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
    const { name, type, qty, method, discount, userId } = req.body;

    var errors = [];

		if(!name || !name.length) {
			errors.push("name");
    }

    if(!type || !type.length || (type != "qty" && 
      type != "private" && type != "value" && type != "freight")) {
      errors.push("type");
    }

    if(type === "private") {
      if(!userId || !userId.length) {
        errors.push("userId");
      }

      for(var id of userId) {
        if(!id || !id.length || !mongoose.Types.ObjectId.isValid(id)) {
          errors.push("userId");
          break;
        }

        if(!(await users.findById(id).exec())) {
          errors.push("userId is not found");
          break;
        }
      }
    } else if(type === "freight" && method != "cash") {
        errors.push("type and method wrongs");
    }

    await coupons.findOne({ name: name.trim() }).then((response) => {
			if(response) {
        return res.status(400).send("There is a coupon using this name, try another!");
      } else {
        if(qty < 0) {
          errors.push("qty");
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
        
        coupons.create({
          name,
          type,
          qty,
          method,
          discount,
          available: true,
          userId: (type === "private") ? userId : []
        }).then((response) => {
          if(response) {
            return res.status(201).send("Coupon created successfully!");
          } else {
            return res.status(400).send("We couldn't create a new coupon, try again later!");
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
    const { name, type, qty, method, discount, available, userId } = req.body;

    if(!couponId || !couponId.length || !mongoose.Types.ObjectId.isValid(couponId)) {
			return res.status(400).send("Invalid id!");
		}

    var errors = [];

		if(!name || !name.length) {
			errors.push("name");
    }

    if(!type || !type.length || (type != "qty" && 
      type != "private" && type != "value" && type != "freight")) {
      errors.push("type");
    }
    
    if(type === "private") {
      
      if(!userId || !userId.length) {
        errors.push("userId");
      }

      for(var id of userId) {
        if(!id || !id.length || !mongoose.Types.ObjectId.isValid(id)) {
          errors.push("userId");
          break;
        }

        if(!(await users.findById(id).exec())) {
          errors.push("userId is not found");
          break;
        }
      }
    } else if(type === "freight" && method != "cash") {
      errors.push("type and method wrongs");
    }

    await coupons.findOne({ name: name.trim() }).then((response) => {
			if(response && (response._id != couponId)) {
        return res.status(400).send("There is a coupon using this name, try another!");
      } else {
        if(qty < 0) {
          errors.push("qty");
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

        coupons.findById(couponId).then((coupon) => {
          if(coupon) {
            coupon.name = name;
            coupon.type = type;
            coupon.qty = qty;
            coupon.method = method;
            coupon.discount = discount;
            coupon.available = available;
            coupon.userId = (type === "private") ? userId : [];
            
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