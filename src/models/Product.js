//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const Schema = mongoose.Schema;
const productMenuSchema = require("./ProductMenu");
const productAdditionSchema = require("./Addition");

//	Defining Product schema
const productSchema = Schema({
	product: {
		type: productMenuSchema,
		required: true
	},
	size: {
		type: Number,
		required: true
	},
	additions: {
		type: [productAdditionSchema],
		default: []
	},
	note: {
		type: String,
		default: null
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Products on database
mongoose.model("Products", productSchema);