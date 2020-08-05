//  Requiring database
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
    required: true,
  },

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection ProductsMenu on database
mongoose.model("ProductsMenu", productMenuSchema);