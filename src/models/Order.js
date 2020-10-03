//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const Schema = mongoose.Schema;
const userSchema = require("./User");
const productSchema = require("./Product");

//	Defining Order schema
const orderSchema = Schema({
	user: {
		type: userSchema,
		required: true,
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
	status: {
		type: Boolean,
		default: false
	},
	feedback: {
		type: String,
		default: null
  },
  typePayament: {
    type: Number,
    reqired: true
  },
  troco: {
    type: Number,
    default: null
  },
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Orders on database
mongoose.model("Orders", orderSchema);