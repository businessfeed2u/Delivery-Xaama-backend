//  Requiring database
const mongoose = require("mongoose");

//	Loading Users collection from database
require("../models/User");
const users = mongoose.model("Users");

module.exports = {
  eAdmin: function(req, res, next){
    const userId = req.headers.authorization;

		if(!userId || !userId.length) {
			return res.status(400).send("No user is logged in!");
		}
    
    users.findById(userId).then((response) => {
      if(response) {
        if(response.userType != 2) {
          return res.status(401).send("User not authorized!");
        }
        return next();
      } else {
        return res.status(400).send("User not found!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
    });
  },

  eManager: function(req, res, next){
    const userId = req.headers.authorization;

		if(!userId || !userId.length) {
			return res.status(400).send("No user is logged in!");
		}
    
    users.findById(userId).then((response) => {
      if(response) {
        if(response.userType != 1 && response.userType != 2) {
          return res.status(401).send("User not authorized!");
        }
        return next();
      } else {
        return res.status(400).send("User not found!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
    });
  }
};