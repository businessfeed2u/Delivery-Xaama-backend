//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;
const timetableSchema = require("./Timetable");

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
  systemOpenByHour: {
    type: Boolean,
    default: true
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
  }
}, {
	toJSON: {
		virtuals: true,
	},
});

//	Creating route to get logo url
companySchema.virtual("logo_url").get(function() {
	return this.logo ? `http://localhost:4000/files/${this.logo}` : null;
});

//	Creating collection Company on database
mongoose.model("Company", companySchema);