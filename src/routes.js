//  Requiring express-js
const express = require("express");

//  Requiring route controllers
const SessionController = require("./controllers/SessionController");
const UserController = require("./controllers/UserController");
const ContactsController = require("./controllers/ContactsController");
const SystemController = require("./controllers/SystemController");

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
routes.post("/user", UserController.create);
routes.put("/user", UserController.update);
routes.delete("/user", UserController.delete);

//  Contacts
routes.get("/contacts/:id", ContactsController.index);
routes.post("/contacts", ContactsController.create);
routes.put("/contacts/:id", ContactsController.update);
routes.delete("/contacts/:id", ContactsController.delete);
routes.get("/contacts", ContactsController.user);
routes.get("/contactsSearch", ContactsController.search);

//  Development routes - caution
routes.get("/allUsers", SystemController.allUsers);
routes.get("/allContacts", SystemController.allContacts);
routes.get("/deleteAllUsers", SystemController.deleteAllUsers);
routes.get("/deleteAllContacts", SystemController.deleteAllContacts);

module.exports = routes;