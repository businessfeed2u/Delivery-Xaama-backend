//  Requiring database
const mongoose = require("mongoose");

//	Loading Pizzas Menu collection from database
require("../models/PizzaMenu");
const pizzas = mongoose.model("PizzasMenu");

//	Exporting Pizzas Menu features
module.exports = {
	//	Return a pizza on database given id
	async index(req, res) {
    const pizzaId = req.params.id;
		
		await pizzas.findOne({ _id: pizzaId }).then((pizza) => {
			if(pizza) {
				return res.status(200).json(pizza);
			} else {
				return res.status(400).send("Pizza not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },

  //	Create a new pizza for the menu
	async create(req, res) {
    const { name, ingredients, prices } = req.body;
    const { filename } = req.file;

    if(name && name.length && ingredients && ingredients.length && prices){
      await pizzas.create({
        name,
        ingredients: ingredients.split(',').map(ingredient => ingredient.trim()),
        prices: prices.split(',').map(price => parseFloat(price.trim())),
        thumbnail: filename
      }).then((response) => {
        if(response) {
          return res.status(201).send("Pizza created successfully!");
        } else {
          return res.status(400).send("We couldn't create a new pizza, try again later!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    } else {
      return res.status(400).send("Name, ingredients or price are empty!");
    }
	},
  

}