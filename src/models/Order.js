//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Order schema
const orderSchema = Schema({
  
  hamburger: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'HamburgersMenu',
  },

  pizza: {
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
