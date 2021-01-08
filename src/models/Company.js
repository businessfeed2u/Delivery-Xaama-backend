//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;
const timetableSchema = require("./Timetable");
const cardFidelitySchema = require("./CardFidelity");

//	Defining Company schema
const companySchema = Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	freight: {
		type: Number,
		required: true
	},
	productTypes: {
		type: [String],
		required: true
  },
  systemOpenByAdm: {
	type: Boolean,
	default: true
  },
  manual: {
	type: Boolean,
	default: false
  },
	logo: {
		type: String,
		default: null
	},
	carousel: {
		type: [String],
		default: null
  },
  timetable: {
    type: [timetableSchema],
    default: null
  },
  timeWithdrawal: {
    type: Number,
    required: true
  },
  timeDeliveryI: {
    type: Number,
    required: true
  },
  timeDeliveryF: {
    type: Number,
    required: true
  },
  cards: {
    type: [cardFidelitySchema],
    default: null
  },
}, {
	toJSON: {
		virtuals: true,
	},
});

//	Creating route to get logo url
companySchema.virtual("logo_url").get(function() {
	return this.logo ? `files/${this.logo}` : null;
});

//	Creating route to get carousel urls
companySchema.virtual("carousel_urls").get(function() {
	var imNames = [];
	for(const c of this.carousel) {
		imNames.push(c ? `files/${c}` : null);
	}

	return imNames.length ? imNames : null;
});

//	Creating collection Company on database
mongoose.model("Company", companySchema);