//  Requiring express-js
const express = require("express");

// Requiring upload controller
const multer = require("multer");
const uploadConfig = require("./config/upload");
const upload = multer(uploadConfig);

//  Requiring route controllers
const SessionController = require("./controllers/SessionController");
const UserController = require("./controllers/UserController");
const SystemController = require("./controllers/DevelopmentController");
const HamburgerController = require("./controllers/HamburgerController");
const PizzaController = require("./controllers/PizzaController");
const PizzaAdditionController = require("./controllers/PizzaAdditionController");
const HamburgerAdditionController = require("./controllers/HamburgerAdditionController");

//  Setting up routes
const routes = express.Router();

//  Home
routes.get("/", (req, res) => {
    console.log(req.body);
    return res.status(200).send("Backend is running");
});

//	Session
routes.get("/session", SessionController.index);
routes.post("/session", SessionController.create);

//  User
routes.get("/user", UserController.index);
routes.post("/user", UserController.create);
routes.put("/user", UserController.update);
routes.delete("/user", UserController.delete);

// Hamburger
routes.get("/hamburger/:id", HamburgerController.index);
routes.post("/hamburger", upload.single("thumbnail"), HamburgerController.create);
routes.put("/hamburger/:id", upload.single("thumbnail"), HamburgerController.update);
routes.delete("/hamburger/:id", HamburgerController.delete);
routes.get("/hamburger", HamburgerController.allHamburgers);

// Hamburger addition
routes.get("/hamburgerAddition/:id", HamburgerAdditionController.index);
routes.post("/hamburgerAddition", upload.single("thumbnail"), HamburgerAdditionController.create);
routes.put("/hamburgerAddition/:id", upload.single("thumbnail"), HamburgerAdditionController.update);
routes.delete("/hamburgerAddition/:id", HamburgerAdditionController.delete);
routes.get("/hamburgerAddition", HamburgerAdditionController.allHamburgerAdditions);

// Pizza
routes.get("/pizza/:id", PizzaController.index);
routes.post("/pizza", upload.single("thumbnail"), PizzaController.create);
routes.put("/pizza/:id", upload.single("thumbnail"), PizzaController.update);
routes.delete("/pizza/:id", PizzaController.delete);
routes.get("/pizza", PizzaController.allPizzas);

// Pizza addition
routes.get("/pizzaAddition/:id", PizzaAdditionController.index);
routes.post("/pizzaAddition", upload.single("thumbnail"), PizzaAdditionController.create);
routes.put("/pizzaAddition/:id", upload.single("thumbnail"), PizzaAdditionController.update);
routes.delete("/pizzaAddition/:id", PizzaAdditionController.delete);
routes.get("/pizzaAddition", PizzaAdditionController.allPizzaAdditions);


//  Development routes - caution
routes.get("/allUsers", SystemController.allUsers);
routes.get("/deleteAllUsers", SystemController.deleteAllUsers);

module.exports = routes;