//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Order schema
const orderSchema = Schema({
  
  

	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Pedidos on database
mongoose.model("Pedidos", orderSchema);
