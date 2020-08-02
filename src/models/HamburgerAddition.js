//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Hamburger Additions schema
const hamburgerAdditionSchema = Schema({
  
  name: {
    type: String,
    require: true,
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

//	Creating collection HamburgerAdditions on database
mongoose.model("HamburgerAdditions", hamburgerAdditionSchema);