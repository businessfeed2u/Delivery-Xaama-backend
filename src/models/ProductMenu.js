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
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	prices: {
		type: [Number],
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
  return `http://localhost:4000/files/${this.thumbnail}`;
});

//	Creating collection ProductsMenu on database
mongoose.model("ProductsMenu", productMenuSchema);