//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const { Schema } = mongoose;
const userSchema = require("./User");
const productSchema = require("./Product");

//	Defining Order schema
const orderSchema = Schema({
	user: {
		type: userSchema,
		required: true
	},
	products: {
		type: [productSchema],
		required: true
	},
	total: {
		type: Number,
		required: true
	},
	deliver: {
		type: Boolean,
		required: true
	},
	address: {
		type: [String],
		default: null
	},
	phone: {
		type: String,
		required: true
	},
	status: {
		type: Boolean,
		default: false
	},
	feedback: {
		type: Boolean,
		default: false
	},
	typePayment: {
		type: Number,
		reqired: true
	},
	change: {
		type: Number,
		default: null
	},
	creationDate: {
		type: String,
		default: ""
	}
});

//	Creating collection Orders on database
mongoose.model("Orders", orderSchema);
