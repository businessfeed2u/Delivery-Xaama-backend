//  Loading express-js and multer modules
const express = require("express");
const multer = require("multer");

//	Loading upload controller and setting it up
const uploadConfig = require("./config/upload");
const upload = multer(uploadConfig);

//	Loading helpers
const authorization = require("./helpers/auth");
const validation = require("./helpers/validation");

//  Loading route controllers
const SessionController = require("./controllers/SessionController");
const companyController = require("./controllers/CompanyController");
const UserController = require("./controllers/UserController");
const ProductController = require("./controllers/ProductController");
const AdditionController = require("./controllers/AdditionController");
const OrderController = require("./controllers/OrderController");
const SocketController = require("./controllers/SocketController");
const CouponController = require("./controllers/CouponController");
const RatingController = require("./controllers/RatingController");

//  Setting up routes
const routes = express.Router();

//  Home
routes.get("/", (req, res) => {
	return res.status(200).send("Backend is running");
});

//	Session
routes.get("/session", authorization.verify, SessionController.index);
routes.post("/session", SessionController.create);

//	Company
routes.get("/company", companyController.companyData);
routes.put("/company", authorization.admin, companyController.update);
routes.put("/companyImages", authorization.admin, upload.single("image"), companyController.updateImages);
routes.put("/companyUpdateUser", authorization.admin, companyController.updateUser);
routes.put("/companyUpdateCards", authorization.admin, companyController.updateCards);
routes.put("/companyUpdateTimetable", authorization.admin, companyController.updateOpeningHours);
routes.get("/productTypes", companyController.productTypes);

//	User
routes.get("/user", authorization.verify, UserController.index);
routes.post("/user", upload.single("thumbnail"), validation.createUser, UserController.create);
routes.put("/user", authorization.verify, validation.updateUser, UserController.update);
routes.put("/userThumbnail", authorization.verify, upload.single("thumbnail"), validation.updateUserThumbnail, UserController.updateThumbnail);
routes.put("/userUpdateCard", authorization.manager, validation.updateUserCard, UserController.updateCard);
routes.put("/userCard", authorization.admin, UserController.updateAll);
routes.delete("/user", authorization.verify, UserController.delete);
routes.get("/userAll", authorization.admin, UserController.all);

//	Product
routes.get("/product/:id", ProductController.index);
routes.post("/product", authorization.manager, upload.single("thumbnail"), validation.createProduct, ProductController.create);
routes.put("/product/:id", authorization.manager, validation.updateProduct, ProductController.update);
routes.put("/productThumbnail/:id", authorization.manager, upload.single("thumbnail"), validation.updateProductThumbnail, ProductController.updateThumbnail);
routes.delete("/product/:id", authorization.manager, ProductController.delete);
routes.get("/product", ProductController.all);

//	Product addition
routes.get("/addition/:id", AdditionController.index);
routes.post("/addition", authorization.manager, upload.single("thumbnail"), validation.createAddition, AdditionController.create);
routes.put("/addition/:id", authorization.manager, validation.updateAddition, AdditionController.update);
routes.put("/additionThumbnail/:id", authorization.manager, upload.single("thumbnail"), validation.updateThumbnailAddition, AdditionController.updateThumbnail);
routes.delete("/addition/:id", authorization.manager, AdditionController.delete);
routes.get("/addition", AdditionController.all);

//	Order
routes.get("/order", authorization.verify, OrderController.index);
routes.post("/order", authorization.verify, OrderController.create);
routes.put("/order/:id", authorization.admin, OrderController.update);
routes.delete("/order", authorization.manager, OrderController.delete);
routes.get("/orderAll", authorization.manager, OrderController.all);

//	Coupon
routes.get("/coupon", authorization.verify, CouponController.index);
routes.post("/coupon", authorization.admin, validation.createCoupon, CouponController.create);
routes.put("/coupon/:id", authorization.admin, validation.updateCoupon, CouponController.update);
routes.put("/couponUser/:id", authorization.verify, validation.updateUserCoupon, CouponController.updateUserCoupon);
routes.delete("/coupon/:id", authorization.admin, CouponController.delete);
routes.get("/couponAll", authorization.admin, CouponController.all);

//	Socket
routes.delete("/socket", authorization.manager, SocketController.delete);
routes.delete("/sockets", authorization.manager, SocketController.deleteAll);

// Rating
routes.post("/rating", authorization.verify, validation.createRating, RatingController.create);
routes.put("/rating/:id", authorization.manager, RatingController.update);
routes.delete("/rating/:id", authorization.manager, RatingController.delete);
routes.get("/ratingAll", RatingController.all);

module.exports = routes;