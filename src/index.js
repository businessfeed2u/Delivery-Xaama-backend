//  Loading expressjs, CORS, database and routes modules
const express = require("express");
const cors = require("cors");
const http = require("http");
const routes = require("./routes");
require("./config/database");
const path = require("path");

const { setupWebsocket } = require("./config/websocket");

//  Setting up express and port number
const app = express();
const port = process.env.PORT || 4000;

// Using modules for front-end and back-end connection
const server = http.Server(app);
setupWebsocket(server);

//  Configuring CORS
const corsOptions = {
	origin: process.env.URL,
	optionsSuccessStatus: 200
};

//  Must be below middleware
//  Using modules
app.use(express.json());
app.use(cors(corsOptions));
app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(routes);

//  Listening requests on the given port
server.listen(port, () => {
	console.log(`Server running on port ${port}`);
}).on("error", (error) => {
	console.error(`Unable to listen to port: ${port}\n`, error);
});
