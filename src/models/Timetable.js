//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose
const Schema = mongoose.Schema;

//	Defining Timetable schema
const timetableSchema = Schema({
	dayWeek: {
    type: String,
    require: true
  },
  beginHour: {
    type: Date,
    default: null
  },
  endHour: {
    type: Date,
    default: null
  },
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Timetables on database
mongoose.model("Timetable", timetableSchema);