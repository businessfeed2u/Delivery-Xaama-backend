//  Loading database and bcryptjs modules
const mongoose = require("mongoose");

//	Loading Assessments collection from database
require("../models/Assessments");
require("../models/User");

const assessments = mongoose.model("Assessments");
const users = mongoose.model("Users");

//	Exporting Assessments features
module.exports = {
  //	Return all assessments
  async create(req, res) {
    const { userId, feedback, stars } = req.body;
    var errors = [];

    if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send("Invalid user id!");
		}

    if(!(await users.findById(userId).exec())) {
      errors.push("userId");
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
    
    await assessments.create({
      userId,
      feedback,
      stars
    }).then((response) => {
      if(response) {
        return res.status(201).json(response);
      } else {
        return res.status(400).send("We couldn't create a new assessments, try again later!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
    });

  },

  //	Return all assessments
  async delete(req, res) {
    const assessmentsId = req.params.id;

		if(!assessmentsId || !assessmentsId.length || !mongoose.Types.ObjectId.isValid(assessmentsId)) {
			return res.status(400).send("Invalid assessments id!");
		}

		await assessments.findByIdAndDelete(assessmentsId).then((response) => {
			if(response) {
        return res.status(200).send("The assessments have been deleted!");
			} else {
				return res.status(404).send("Assessments not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },

	//	Return all assessments
  async all(req, res) {
    await assessments.find().sort({
			stars: "asc",
			creationDate: "asc"
		}).then((response) => {
			return res.status(200).json(response);
		}).catch((error) => {
			return res.status(500).send(error);
		});
  }

};