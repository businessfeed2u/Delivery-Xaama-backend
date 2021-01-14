//  Loading database module
const mongoose = require("mongoose");

//	Using schema feature from mongoose and calling schemas
const Schema = mongoose.Schema;

//	Defining coupon schema
const CouponSchema = Schema({
	name: {
		type: String,
		required: true
	},
	userId: {
		type: [String],
    required: true
  },
  type: {
		type: String,
		required: true
  },
  qty: {
		type: Number,
    default: 0,
    required: true
  },
  method: {
		type: String,
		required: true
  },
  discount: {
		type: Number,
    default: 10,
    required: true
  },
  available: {
		type: Boolean,
		default: true,
    required: true
  },
	creationDate: {
		type: Date,
		default: Date.now()
	}
});

//	Creating collection Coupons on database
mongoose.model("Coupons", CouponSchema);