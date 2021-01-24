//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining ProductMenu schema
const productMenuSchema = Schema({
	name: {
		type: String,
		required: true,
	},
	ingredients: {
		type: [String],
		required: false,
	},
	type: {
		type: String,
		required: true,
	},
	prices: {
		type: [Number],
		required: true,
	},
	sizes: {
		type: [String],
		required: true,
	},
	available: {
		type: Boolean,
		default: true,
	},
	thumbnail: {
		type: String,
		default: null
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
}, {
	toJSON: {
		virtuals: true,
	},
});

//	Creating route to get thumbnails
productMenuSchema.virtual("thumbnail_url").get(function() {
	return this.thumbnail ? `files/${this.thumbnail}` : null;
});

//	Creating collection ProductsMenu on database
mongoose.model("ProductsMenu", productMenuSchema);