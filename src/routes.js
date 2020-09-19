//  Loading express-js and multer modules
const express = require("express");
const multer = require("multer");

//	Loading upload controller and setting it up
const uploadConfig = require("./config/upload");
const upload = multer(uploadConfig);

//	Loading helpers
const authorization = require("./helpers/auth");

//  Loading route controllers
const SessionController = require("./controllers/SessionController");
const companyController = require("./controllers/CompanyController");
const UserController = require("./controllers/UserController");
const ProductController = require("./controllers/ProductController");
const AdditionController = require("./controllers/AdditionController");
const OrderController = require("./controllers/OrderController");
const SocketController = require("./controllers/SocketController");

//  Setting up routes
const routes = express.Router();

//  Home
routes.get("/", (req, res) => {
	return res.status(200).send("Backend is running");
});

//	Session
routes.get("/session", SessionController.index);
routes.post("/session", SessionController.create);

//	Company
routes.get("/productTypes", companyController.productTypes);
routes.get("/company", companyController.companyData);
routes.put("/company", authorization.admin, companyController.update);
routes.post("/company", authorization.admin, upload.single("logo"), companyController.manageCompanyData);

//	User
routes.get("/user/:id", UserController.index);
routes.post("/user", upload.single("thumbnail"), UserController.create);
routes.put("/user", upload.single("thumbnail"), UserController.update);
routes.delete("/user", UserController.delete);
routes.get("/user", authorization.admin, UserController.all);

//	Product
routes.get("/product/:id", ProductController.index);
routes.post("/product", authorization.manager, upload.single("thumbnail"), ProductController.create);
routes.put("/product/:id", authorization.manager, upload.single("thumbnail"), ProductController.update);
routes.delete("/product/:id", authorization.manager, ProductController.delete);
routes.get("/product", ProductController.all);

//	Product addition
routes.get("/addition/:id", AdditionController.index);
routes.post("/addition", authorization.manager, upload.single("thumbnail"), AdditionController.create);
routes.put("/addition/:id", authorization.manager, upload.single("thumbnail"), AdditionController.update);
routes.delete("/addition/:id", authorization.manager, AdditionController.delete);
routes.get("/addition", AdditionController.all);

//	Order
routes.get("/order/:id", OrderController.index);
routes.post("/order", OrderController.create);
routes.put("/order/:id", OrderController.update);
routes.delete("/order", authorization.manager, OrderController.delete);
routes.get("/order", authorization.manager, OrderController.all);

//	Socket
routes.delete("/socket", SocketController.delete);
routes.delete("/sockets", SocketController.deleteAll);

module.exports = routes;