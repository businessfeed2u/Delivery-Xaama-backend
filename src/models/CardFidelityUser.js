//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const Schema = mongoose.Schema;
const cardFidelitySchema = require("./CardFidelity");

//	Defining Card Fidelity User schema
const cardFidelityUserSchema = Schema({
  cardFidelity: {
		type: cardFidelitySchema,
		required: true,
	},
  qtdCurrent: {
		type: Number,
    default: 0
	}
});

//	Creating collection CardsFidelityUser on database
mongoose.model("CardsFidelityUser", cardFidelityUserSchema);