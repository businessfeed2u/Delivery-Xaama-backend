//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const { Schema } = mongoose;

//	Defining socket schema
const socketSchema = Schema({
	id: {
		type: String,
		required: true
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection sockets on database
mongoose.model("sockets", socketSchema);
