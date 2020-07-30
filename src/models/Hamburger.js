//  Requiring database
const mongoose = require("mongoose");
const hamburgerMenuSchema = require("./HamburgerMenu");
const hamburgerAdditionSchema = require("./HamburgerAddition");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Hamburger schema
const hamburgerSchema = Schema({
  
    hamburger: {
        type: hamburgerMenuSchema,
        required: true
    },

    additions: {
        type: [hamburgerAdditionSchema]
    },

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Hamburger on database
mongoose.model("Hamburger", hamburgerSchema);
