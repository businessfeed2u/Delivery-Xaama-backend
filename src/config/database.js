//	Requiring mongoose module
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

//	Setting up mongoose
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

//	Defining database server
const uri = "mongodb+srv://easycontactsadmin:" + process.env.DBPASSWORD + "@easycontacts-yvbgh.mongodb.net/test?retryWrites=true&w=majority";

//	Connecting to database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	console.log("Connection to database has been established successfully.");
}).catch((error) => {
	console.error("Unable to connect to the database:", error);
});

//	Exporting database connection
module.exports = mongoose;