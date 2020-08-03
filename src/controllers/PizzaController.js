//  Requiring database
const mongoose = require("mongoose");

//	Loading Pizzas Menu collection from database
require("../models/PizzaMenu");
const pizzas = mongoose.model("PizzasMenu");

// Loading module for to delete uploads
const fs = require("fs");

//	Exporting Pizza Menu features
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
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !ingredients || !ingredients.length || !prices) {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }

      return res.status(400).send("Name, ingredients or price are empty!");
    }

    await pizzas.create({
      name,
      ingredients: ingredients.split(",").map(ingredient => ingredient.trim()),
      prices: prices.split(",").map(price => parseFloat(price.trim())),
      thumbnail: filename
    }).then((response) => {
      if(response) {
        return res.status(201).send("Pizza created successfully!");
      } else {
        if(filename) {
          fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
        }

        return res.status(400).send("We couldn't create a new pizza, try again later!");
      }
    }).catch((error) => {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }

      return res.status(500).send(error);
    });
	},
  
  //	Update a specific pizza
  async update(req, res) {
    const pizzaId = req.params.id;
    
    const { name, ingredients, prices } = req.body;
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !ingredients || !ingredients.length || !prices) {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }

      return res.status(400).send("Name, ingredients or price are empty!");
    }

    await pizzas.findOneAndUpdate({ _id: pizzaId }, {
      name,
      ingredients: ingredients.split(",").map(ingredient => ingredient.trim()),
      prices: prices.split(",").map(price => parseFloat(price.trim())),
      thumbnail: filename
    }).then((response) => {
      if(response) {
        if(response.thumbnail) {
          fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);
        }

        return res.status(200).send("The pizza has been updated!");
      } else {
        return res.status(400).send("Pizza not found!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
    });
	},
  
  //	Delete a specific pizza
	async delete(req, res) {
		const pizzaId = req.params.id;

		await pizzas.findOneAndDelete({ _id: pizzaId }).then((response) => {
			if(response) {
        try {
          fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);

          return res.status(200).send("The pizza and its thumbnail have been deleted!");
        } catch(e){
          return res.status(200).send("The pizza was deleted, but the thumbnail was not found");
        }
			} else {
				return res.status(400).send("Pizza not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
  
  //	Return all hamburgers
	async allPizzas(req, res) {
		await pizzas.find().sort({ 
      name: "asc", 
      creationDate: "asc" 
    }).then((response) => {
			if(response && response.length ) {
        return res.status(200).json(response);
			} else {
				return res.status(400).send("Pizzas not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};