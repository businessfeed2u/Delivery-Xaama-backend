//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining pizzaMenu schema
const pizzaMenu = Schema({
  
  name: {
    type: String,
    require: true,
  },

  ingredients: {
    type: [String],
    required: true,
  },

  prices: {
    type: [Number],
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

//	Creating collection PizzaMenu on database
mongoose.model("PizzasMenu", pizzaMenu);
