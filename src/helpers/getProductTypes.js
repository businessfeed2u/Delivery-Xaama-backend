//  Requiring database
const mongoose = require("mongoose");

//	Loading Company schema and Company collection from database
require("../models/Company");
const company = mongoose.model("Company");

module.exports = {
	//	Return product types on database
	async index(req, res) {
	
		await company.findOne({}).then((response) => {
			if(response) {
				return res.status(200).json(response.productTypes);
			} else {
				return res.status(400).send("Product types not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  }
};