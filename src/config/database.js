//	Loading mongoose and dotenv modules
const mongoose = require("mongoose");
require("dotenv").config();

//	Setting up mongoose
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);

//	Defining database server
const uri = "mongodb+srv://admin:" + process.env.DBPASSWORD + "@deliveryxaama.wrom8.mongodb.net/deliveryxaama?retryWrites=true&w=majority";

//	Connecting to database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	console.log("Connection to database has been established successfully.");
}).catch((error) => {
	console.error("Unable to connect to the database:\n", error);
});

//	Exporting database connection
module.exports = mongoose;