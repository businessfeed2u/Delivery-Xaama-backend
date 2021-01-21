//  Loading database and bcryptjs modules
const mongoose = require("mongoose");

//	Loading rating, Order and User collections from database
require("../models/Rating");
require("../models/User");
require("../models/Order");

const rating = mongoose.model("Rating");
const users = mongoose.model("Users");
const orders = mongoose.model("Orders");

//	Exporting rating features
module.exports = {
  //	Return all rating
  async create(req, res) {

    const { orderId, feedback, stars } = req.body;
    const userId = req.headers.authorization;
    
    var errors = [];

    if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send("Invalid user id!");
		}

    if(!(await users.findById(userId).exec())) {
      errors.push("userId");
    }

    if(!orderId || !orderId.length || !mongoose.Types.ObjectId.isValid(orderId)) {
			return res.status(400).send("Invalid orderId id!");
		}

    if(!feedback || !feedback.length) {
      errors.push("feedback");
    }

    if(!stars || stars < 0 || stars > 5) {
      errors.push("stars");
    }

    if(errors.length) {
			const message = "Invalid " + errors.join(", ") + " value" + (errors.length > 1 ? "s!" : "!");

			return res.status(400).send(message);
    }

    const keysSearch = {"$and": [ {"userId": userId}, {"orderId": orderId} ] };

    await orders.findById(orderId).then((order) => {
      if(order) {
        if(order.user._id == userId ) {
          rating.find( keysSearch )
          .then((response) => {
            if(response && response.length) {
              return res.status(400).send("Have you already submitted this request!");
            } else {
              rating.create({
                userId,
                orderId,
                feedback,
                stars
              }).then((ratingCreate) => {
                if(ratingCreate) {
                  order.feedback = true;
                  order.save().then((response) => {
                    if(response) {
                      return res.status(201).json(ratingCreate);
                    } else {
                      return res.status(400).send("Created a new rating, but did not update the feedback!");
                    }
                  }).catch((error) => {
                    return res.status(500).send(error);
                  });
                } else {
                  return res.status(400).send("We couldn't create a new rating, try again later!");
                }
              }).catch((error) => {
                return res.status(500).send(error);
              });
            }
          }).catch((error) => {
            return res.status(500).send(error);
          });
        } else {
          return res.status(400).send("user not authorized!");
        }
      } else {
        return res.status(400).send("Order is not found!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
    });
  },

  //	Return all rating
  async delete(req, res) {
    const ratingId = req.params.id;

		if(!ratingId || !ratingId.length || !mongoose.Types.ObjectId.isValid(ratingId)) {
			return res.status(400).send("Invalid rating id!");
		}

		await rating.findByIdAndDelete(ratingId).then((response) => {
			if(response) {
        return res.status(200).send("The rating have been deleted!");
			} else {
				return res.status(404).send("rating not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },

	//	Return all rating
  async all(req, res) {
    await rating.find().sort({
			stars: "desc",
			creationDate: "asc"
		}).then((response) => {
			return res.status(200).json(response);
		}).catch((error) => {
			return res.status(500).send(error);
		});
  }

};