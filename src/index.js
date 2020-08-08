//  Loading expressjs, CORS, database and routes modules
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
require("./config/database");

//  Setting up express and port number
const app = express();
const port = process.env.PORT || 4000;

//  Using modules
app.use(express.json());
app.use(cors());
app.use(routes);

//  Listening requests on the given port
app.listen(port, () => {
	console.log("Server running on port " + port);
}).on("error", (error) => {
	console.error("Unable to listen to port: " + port + "\n", error);
});