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
    type: String,
    required: true,
  },

  price: {
    type: [Number],
    require: true,
  },

  spare: {
    type: Boolean,
    require: true,
  },

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection PizzaMenu on database
mongoose.model("PizzaMenu", pizzaMenu);
