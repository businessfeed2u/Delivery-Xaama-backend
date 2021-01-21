//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const Schema = mongoose.Schema;

//	Defining Order schema
const ratingSchema = Schema({
	userId: {
		type: String,
		required: true,
  },
  name: {
		type: String,
		required: true
  },
  thumbnail: {
		type: String,
		default: null
	},
  orderId: {
		type: String,
		required: true,
	},
	feedback: {
		type: String,
		default: null
  },
  stars: {
    type: Number,
		default: 0
  },
  approved: {
		type: Boolean,
		default: false
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

//	Creating route to get thumbnail url
ratingSchema.virtual("thumbnail_url").get(function() {
	return this.thumbnail ? `files/${this.thumbnail}` : null;
});

//	Creating collection rating on database
mongoose.model("Rating", ratingSchema);