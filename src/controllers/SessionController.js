//  Loading database, bcryptjs, jwt and dotenv modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
require("dotenv").config();

//	Loading Users collection from database
require("../models/User");
const users = mongoose.model("Users");

//	Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");

//	Exporting Session features
module.exports = {
	//	Return user info from current session
	async index(req, res) {
		const userId = req.headers.authorization;

		if(!userId || !userId.length || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).send(lang["invId"]);
		}

		await users.findById(userId).then((user) => {
			if(user) {
				return res.status(200).json(user);
			} else {
				return res.status(404).send(lang["nFUser"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new session web token from user data and return it
	async create(req, res) {
		const { email, password, recaptchaToken } = req.body;
		const errors = [];

		if(!email || !email.length || !regEx.email.test(email)) {
			errors.push(lang["invEmail"]);
		}

		if(!password || !password.length) {
			errors.push(lang["invPassword"]);
    }

    if(!recaptchaToken || !recaptchaToken.length) {
			errors.push(lang["invToken"]);
    }

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
    }

    var SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    var VERIFY_URL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${recaptchaToken}`;

    await fetch(VERIFY_URL, { method: "POST" }).then(res => res.json())
      .then((json) => {
        if(json && json.success && json.score >= 0.5) {
          users.findOne({ email: email.trim().toLowerCase() }).then((user) => {
            if(user) {
              bcrypt.compare(password, user.password).then((match) => {
                if(match) {
                  const token = jwt.sign({
                    userId : user._id,
                    userType : user.userType
                  }, process.env.SECRET, {
                    expiresIn: 86400
                  });

                  return res.status(201).json({ user, token });
                } else {
                  return res.status(400).send(lang["wrongEmailOrPassword"]);
                }
              }).catch((error) => {
                return res.status(500).send(error.message);
              });
            } else {
              return res.status(404).send(lang["wrongEmailOrPassword"]);
            }
          }).catch((error) => {
            return res.status(500).send(error);
          });
        } else {
          return res.status(400).send(lang["roboDetected"]);
        }
      }).catch((error) => {
        return res.status(500).send(error.message);
      });
	}
};