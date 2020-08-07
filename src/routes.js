//  Requiring express-js
const express = require("express");

// Requiring upload controller
const multer = require("multer");
const uploadConfig = require("./config/upload");
const upload = multer(uploadConfig);

// Requiring authorization function
const authorized = require("./helpers/auth");

//  Requiring route controllers
const SessionController = require("./controllers/SessionController");
const UserController = require("./controllers/UserController");
const SystemController = require("./controllers/DevelopmentController");
const ProductController = require("./controllers/ProductController");
const AdditionController = require("./controllers/AdditionController");
const OrderController = require("./controllers/OrderController");

//  Setting up routes
const routes = express.Router();

//  Home
routes.get("/", (req, res) => {
	return res.status(200).send("Backend is running");
});

//	Session
routes.get("/session", SessionController.index);
routes.post("/session", SessionController.create);

//  User
routes.get("/user", UserController.index);
routes.post("/user", upload.single("thumbnail"), UserController.create);
routes.put("/user", upload.single("thumbnail"), UserController.update);
routes.delete("/user", UserController.delete);

// Product
routes.get("/product/:id", ProductController.index);
routes.post("/product", upload.single("thumbnail"), ProductController.create);
routes.put("/product/:id", upload.single("thumbnail"), ProductController.update);
routes.delete("/product/:id", ProductController.delete);
routes.get("/product", ProductController.allProducts);

// Product addition
routes.get("/addition/:id", AdditionController.index);
routes.post("/addition", upload.single("thumbnail"), AdditionController.create);
routes.put("/addition/:id", upload.single("thumbnail"), AdditionController.update);
routes.delete("/addition/:id", AdditionController.delete);
routes.get("/addition", AdditionController.allAdditions);

// Order
routes.get("/order/:id", OrderController.index);
routes.post("/order", OrderController.create);
routes.delete("/order/:id", OrderController.delete);
routes.get("/order", OrderController.allOrders);

//  Development routes - caution
routes.get("/allUsers", authorized.eAdmin, SystemController.allUsers);
routes.get("/deleteAllUsers", SystemController.deleteAllUsers);

module.exports = routes;