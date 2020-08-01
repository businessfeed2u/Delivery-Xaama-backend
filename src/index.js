//  Requiring express-js, CORS, database and routes modules
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const database = require("./config/database");

//  Setting up express and port number
const app = express();
const port = process.env.PORT || 4000;

//  Using modules
app.use(express.json());
app.use(cors());
app.use(routes);

//  Listening requests on the given port
app.listen(process.env.PORT || port, () => {
	console.log("Server running on port " + port);
});