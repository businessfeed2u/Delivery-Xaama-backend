//  Requiring database
const mongoose = require("mongoose");

//	Loading Hamburgers collection from database
require("../models/HamburgerMenu");
const hamburgers = mongoose.model("HamburgersMenu");

// Loading module to delete uploads
const fs = require("fs");

//	Exporting Hamburger Menu features
module.exports = {
	//	Return a hamburger on database given id
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
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !ingredients || !ingredients.length || !price) {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }

      return res.status(400).send("Name, ingredients or price are empty!");
    }

    await hamburgers.create({
      name,
      ingredients: ingredients.split(",").map(ingredient => ingredient.trim()),
      price,
      thumbnail: filename
    }).then((response) => {
      if(response) {
        return res.status(201).send("Hamburger created successfully!");
      } else {
        if(filename) {
          fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
        }

        return res.status(400).send("We couldn't create a new hamburger, try again later!");
      }
    }).catch((error) => {
        if(filename) {
          fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
        }

      return res.status(500).send(error);
    });
  },
  
  //	Update a specific hamburger
  async update(req, res) {
    const hamburgerId = req.params.id;
  
    const { name, ingredients, price } = req.body;
    const filename = (req.file) ? req.file.filename : null;
   
    if(!name || !name.length || !ingredients || !ingredients.length || !price) {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }
      
      return res.status(400).send("Name, ingredients or price are empty!");
    }

    await hamburgers.findOneAndUpdate({ _id: hamburgerId }, {
      name,
      ingredients: ingredients.split(",").map(ingredient => ingredient.trim()),
      price,
      thumbnail: filename
    }).then((response) => {
      if(response) {
        if(response.thumbnail) {
          fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);
        }

        return res.status(200).send("The hamburger has been updated!");
      } else {
        return res.status(400).send("Hamburger not found!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
    });
  },
  
  //	Delete a specific hamburger
	async delete(req, res) {
    const hamburgerId = req.params.id;

		await hamburgers.findOneAndDelete({ _id: hamburgerId }).then((response) => {
			if(response) {
        try {
          fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);

          return res.status(200).send("The hamburger and its thumbnail have been deleted!");
        } catch(e){
          return res.status(200).send("The hamburger was deleted, but the thumbnail was not found!");
        }
			} else {
				return res.status(400).send("Hamburger not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },
  
  //	Return all hamburgers
	async allHamburgers(req, res) {
		await hamburgers.find().sort({ 
      name: "asc", 
      price: "asc", 
      creationDate: "asc" 
    }).then((response) => {
			if(response && response.length ) {
        return res.status(200).json(response);
			} else {
				return res.status(400).send("Hamburgers not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};