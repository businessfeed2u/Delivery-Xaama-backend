//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const Schema = mongoose.Schema;

//	Defining Order schema
const assessmentsSchema = Schema({
	userId: {
		type: String,
		required: true,
	},
	feedback: {
		type: String,
		default: null
  },
  stars: {
    type: Number,
		default: 0
  },
  creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Assessments on database
mongoose.model("Assessments", assessmentsSchema);