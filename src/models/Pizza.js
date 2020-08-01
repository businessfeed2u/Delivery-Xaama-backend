//  Requiring database
const mongoose = require("mongoose");
const pizzaMenuSchema = require("./PizzaMenu");
const pizzaAdditionSchema = require("./PizzaAddition");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Hamburger schema
const pizzaSchema = Schema({
  
    pizza: {
        type: pizzaMenuSchema,
        required: true
    },

    size: {
        type: Number,
        required: true
    },

    additions: {
        type: [pizzaAdditionSchema]
    },

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Pizza on database
mongoose.model("Pizza", pizzaSchema);