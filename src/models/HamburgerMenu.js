//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining hamburgerMenu schema
const hamburgerMenuSchema = Schema({
  
  name: {
    type: String,
    require: true,
  },

  ingredients: {
    type: [String],
    required: true,
  },

  price: {
    type: Number,
    require: true,
  },

  available: {
    type: Boolean,
    default: true,
  },

  thumbnail: {
    type: String,
    require: true,
  },

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection HamburgerMenu on database
mongoose.model("HamburgersMenu", hamburgerMenuSchema);