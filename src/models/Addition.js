//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Addition schema
const additionSchema = Schema({
	name: {
		type: String,
		required: true,
	},
	type: {
		type: [String],
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	available: {
		type: Boolean,
		default: true,
	},
	thumbnail: {
		type: String,
		default: null,
	},
	creationDate: {
		type: Date,
		default: Date.now()
	}
}, {
	toJSON: {
		virtuals: true,
	},
});

//	Creating route to get thumbnails
additionSchema.virtual("thumbnail_url").get(() => {
	return this.thumbnail ? `http://localhost:4000/files/${this.thumbnail}` : null;
});

//	Creating collection Additions on database
mongoose.model("Additions", additionSchema);