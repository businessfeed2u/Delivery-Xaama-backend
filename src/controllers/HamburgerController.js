//  Requiring database
const mongoose = require("mongoose");

//	Loading Users collection from database
require("../models/HamburgerMenu");
const hamburgers = mongoose.model("HamburgersMenu");

//	Exporting User features
module.exports = {
	//	Return an hamburger on database given id
	async index(req, res) {
    const hamburgerId = req.params.id;
		
		await hamburgers.findOne({ _id: hamburgerId }).then((hamburger) => {
			if(hamburger) {
        console.log(hamburger);
				return res.status(200).json(hamburger);
			} else {
				return res.status(400).send("hamburger not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },

  //	Create a new hamburger for the menu
	async create(req, res) {

    const { name, ingredients, price } = req.body;
    const { filename } = req.file;

    if(name && name.length && ingredients && ingredients.length && price && price.length){
      await hamburgers.create({
        name,
        ingredients: ingredients.split(',').map(ingredient => ingredient.trim()),
        price,
        thumbnail: filename
      }).then((response) => {
        if(response) {
          console.log(name,ingredients, price, thumbnail);
          return res.status(201).send("hamburger created successfully!");
        } else {
          return res.status(400).send("We couldn't create a new hamburger, try again later!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    } else {
      return res.status(400).send("Name, email or price are empty!");
    }

		
	},
  

}