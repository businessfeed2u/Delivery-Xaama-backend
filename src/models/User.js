//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining User schema
const userSchema = Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone: {
		type: String
	},
	address: {
		type: String
	},
	userType: {
		type: Number,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	thumbnail: {
		type: String,
		default: null
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Users on database
mongoose.model("Users", userSchema);