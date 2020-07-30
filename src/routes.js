//  Requiring express-js
const express = require("express");

// Requiring upload controller
const multer = require('multer');
const uploadConfig = require('./config/upload');
const upload = multer(uploadConfig);

//  Requiring route controllers
const SessionController = require("./controllers/SessionController");
const UserController = require("./controllers/UserController");
//const ContactsController = require("./controllers/ContactsController");
const SystemController = require("./controllers/DevelopmentController");
const HamburgerController = require("./controllers/HamburgerController");
const PizzaController = require("./controllers/PizzaController");

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
routes.post("/hamburger", upload.single('thumbnail'), HamburgerController.create);
//routes.put("/hamburger/:id", HamburgerController.update);
//routes.delete("/hamburger/:id", HamburgerController.delete);
//routes.get("/hamburger", HamburgerController.hamburger);

// Pizza
routes.get("/pizza/:id", PizzaController.index);
routes.post("/pizza", upload.single('thumbnail'), PizzaController.create);
//routes.put("/hamburger/:id", HamburgerController.update);
//routes.delete("/hamburger/:id", HamburgerController.delete);
//routes.get("/hamburger", HamburgerController.hamburger);

//  Contacts
//routes.get("/contacts/:id", ContactsController.index);
//routes.post("/contacts", ContactsController.create);
//routes.put("/contacts/:id", ContactsController.update);
//routes.delete("/contacts/:id", ContactsController.delete);
//routes.get("/contacts", ContactsController.user);
//routes.get("/contactsSearch", ContactsController.search);

//  Development routes - caution
routes.get("/allUsers", SystemController.allUsers);
routes.get("/deleteAllUsers", SystemController.deleteAllUsers);

module.exports = routes;