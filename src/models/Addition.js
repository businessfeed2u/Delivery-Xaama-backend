//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Addition schema
const additionSchema = Schema({
  name: {
    type: String,
    require: true,
  },

  type: {
    type: [String],
    require: true,
  },

  price: {
    type: Number,
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

//	Creating collection Additions on database
mongoose.model("Additions", additionSchema);