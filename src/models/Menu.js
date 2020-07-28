//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Menu schema
const menuSchema = Schema({
  
  name: {
    type: String,
    require: true,
  },

  ingredients: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    require: true,
  },
  
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Menu on database
mongoose.model("Menu", orderSchema);
