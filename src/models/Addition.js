//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Addition schema
const additionSchema = Schema({
	name: {
		type: String,
		required: true,
	},
	type: {
		type: [String],
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	available: {
		type: Boolean,
		default: true,
	},
	thumbnail: {
		type: String,
		default: null,
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Additions on database
mongoose.model("Additions", additionSchema);