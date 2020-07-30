//  Requiring database
const mongoose = require("mongoose");

//	Loading hamburgers collection from database
require("../models/HamburgerMenu");
const hamburgers = mongoose.model("HamburgersMenu");

// Loading module to delete uploads 
const fs = require('fs');

//	Exporting hamburgers features
module.exports = {
	//	Return an hamburger on database given id
	async index(req, res) {
    const hamburgerId = req.params.id;
		
		await hamburgers.findOne({ _id: hamburgerId }).then((hamburger) => {
			if(hamburger) {
				return res.status(200).json(hamburger);
			} else {
				return res.status(400).send("Hamburger not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },

  //	Create a new hamburger for the menu
	async create(req, res) {

    const { name, ingredients, price } = req.body;
    const { filename } = req.file;

    if(name && name.length && ingredients && ingredients.length && price){
      await hamburgers.create({
        name,
        ingredients: ingredients.split(',').map(ingredient => ingredient.trim()),
        price,
        thumbnail: filename
      }).then((response) => {
        if(response) {
          return res.status(201).send("Hamburger created successfully!");
        } else {
          return res.status(400).send("We couldn't create a new hamburger, try again later!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    } else {
      return res.status(400).send("Name, ingredients or price are empty!");
    }
  },
  
  //	Update a specific hamburger
  async update(req, res) {

    const hamburgerId = req.params.id;
    
    const { name, ingredients, price } = req.body;
    const { filename } = req.file;

    if(name && name.length && ingredients && ingredients.length && price){
      await hamburgers.findOneAndUpdate({ _id: hamburgerId }, {
        name,
        ingredients: ingredients.split(',').map(ingredient => ingredient.trim()),
        price,
        thumbnail: filename
      }).then((response) => {
        if(response) {
          console.log(response);
          return res.status(200).send("The hamburger have been updated!");
        } else {
          return res.status(400).send("Hamburger not found!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    } else {
      return res.status(400).send("Name, ingredients or price are empty!");
    }
  },
  
  //	Delete a specific hamburger
	async delete(req, res) {

    const hamburgerId = req.params.id;

		await hamburgers.findOneAndDelete({ _id: hamburgerId }).then((response) => {
			if(response) {
        fs.stat(`${__dirname}/../../uploads/${response.thumbnail}`, function (error, stats) {
          if (error) {
            return res.status(500).send(error);
          }
       
          fs.unlink(`${__dirname}/../../uploads/${response.thumbnail}`,function(err){
              if(error) {
                return res.status(500).send(error);
              }

              return res.status(200).send("The hamburger and thumbnail has been deleted!");
          });  
        });
				
			} else {
				return res.status(400).send("Hamburger not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },
  
  //	Return all hamburgers
	async allHamburgers(req, res) {
		await hamburgers.find().sort({ name: "asc", price: "asc", creationDate: "asc" }).then((response) => {
			if(response && response.length ) {
        return res.status(200).json(response);
			} else {
				return res.status(400).send("Hamburgers not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
}