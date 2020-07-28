//  Requiring database
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Contact schema
const contactSchema = Schema({
	idUser: {
		type: String,
		require: true
	},
	name: {
		type: String,
		require: true
	},
	surname: {
		type: String,
		require: false
	},
	telephone: {
		type: String,
		require: false
	},
	email: {
		type: String,
		require: false
	},
	address: {
		type: String,
		require: false
	},
	annotations: {
		type: String,
		require: false
	},
	imageName: {
		type: String,
		require: false
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Contatos on database
mongoose.model("Contatos", contactSchema);