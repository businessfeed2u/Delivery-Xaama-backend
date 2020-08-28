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
  },
  status: {
    type: Boolean,
    default: false
  },
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Orders on database
mongoose.model("Orders", orderSchema);