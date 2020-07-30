//  Requiring database
const mongoose = require("mongoose");
const userSchema = require("./User");
const pizzaSchema = require("./Pizza");
const hamburgerSchema = require("./Hamburger");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Order schema
const orderSchema = Schema({

  user: {
    type: userSchema,
    required: true,
  },
  
  hamburgers: {
    type: [hamburgerSchema]
  },

  pizzas: {
    type: [pizzaSchema]
  },

  total: {
    type: Number,
    default: 0,
    required: true
  },

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Pedidos on database
mongoose.model("Orders", orderSchema);
