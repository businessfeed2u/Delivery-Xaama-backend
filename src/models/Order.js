//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Order schema
const orderSchema = Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  
  hamburgers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'HamburgersMenu',
  },

  pizzas: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'PizzasMenu',
  },

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Pedidos on database
mongoose.model("Orders", orderSchema);
