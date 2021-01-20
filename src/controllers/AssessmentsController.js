//  Loading database and bcryptjs modules
const mongoose = require("mongoose");

//	Loading Assessments collection from database
require("../models/Assessments");

const assessments = mongoose.model("Assessments");

//	Exporting Assessments features
module.exports = {
  //	Return all assessments
  async create(req, res) {

  },

  //	Return all assessments
  async delete(req, res) {

  },

	//	Return all assessments
  async all(req, res) {

  }

};