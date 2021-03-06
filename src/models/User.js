//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const { Schema } = mongoose;
const cardFidelityUserSchema = require("./CardFidelityUser");

//	Defining User schema
const userSchema = Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone: {
		type: String
	},
	address: {
		type: [String]
	},
	userType: {
		type: Number,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	thumbnail: {
		type: String,
		default: null
	},
	cards: {
		type: [cardFidelityUserSchema],
		default: null
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
}, {
	toJSON: {
		virtuals: true
	}
});

//	Creating route to get thumbnail url
userSchema.virtual("thumbnail_url").get(function() {
	return this.thumbnail ? `files/${this.thumbnail}` : null;
});

//	Creating collection Users on database
mongoose.model("Users", userSchema);
