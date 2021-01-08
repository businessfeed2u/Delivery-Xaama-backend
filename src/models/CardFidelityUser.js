//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const Schema = mongoose.Schema;

//	Defining Card Fidelity User schema
const cardFidelityUserSchema = Schema({
  cardFidelity: {
		type: String,
		required: true,
	},
  qtdCurrent: {
		type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: 0
  },
  status: {
    type: Boolean,
    default: false
  }
});

//	Creating collection CardsFidelityUser on database
mongoose.model("CardsFidelityUser", cardFidelityUserSchema);