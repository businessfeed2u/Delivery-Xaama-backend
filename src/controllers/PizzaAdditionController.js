//  Requiring database
const mongoose = require("mongoose");

//	Loading Pizza Additions collection from database
require("../models/PizzaAddition");
const pizzasAd = mongoose.model("PizzaAdditions");

// Loading module to delete uploads
const fs = require("fs");

//	Exporting Pizza Addition features
module.exports = {
	//	Return a pizza addition on database given id
	async index(req, res) {
    const pizzaAdId = req.params.id;
		
		await pizzasAd.findOne({ _id: pizzaAdId }).then((pizzaAd) => {
			if(pizzaAd) {
				return res.status(200).json(pizzaAd);
			} else {
				return res.status(400).send("Pizza addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
  },

  //	Create a new pizza addition
	async create(req, res) {
    const { name, price } = req.body;
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !price) {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }

      return res.status(400).send("Name or price are empty!");
    }

    await pizzasAd.create({
      name,
      price,
      thumbnail: filename
    }).then((response) => {
      if(response) {
        return res.status(201).send("Pizza addition created successfully!");
      } else {
        if(filename) {
          fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
        }

        return res.status(400).send("We couldn't create a new pizza addition, try again later!");
      }
    }).catch((error) => {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }

      return res.status(500).send(error);
    });
	},
  
  //	Update a specific pizza addition
  async update(req, res) {
    const pizzaAdId = req.params.id;
    
    const { name, price } = req.body;
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !price) {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }

      return res.status(400).send("Name or price are empty!");
    }

    await pizzasAd.findOneAndUpdate({ _id: pizzaAdId }, {
      name,
      price,
      thumbnail: filename
    }).then((response) => {
      if(response) {
        if(response.thumbnail) {
          fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);
        }

        return res.status(200).send("The pizza addition has been updated!");
      } else {
        return res.status(400).send("Pizza addition not found!");
      }
    }).catch((error) => {
      return res.status(500).send(error);
    });
	},
  
  //	Delete a specific pizza addition
	async delete(req, res) {
		const pizzaAdId = req.params.id;

		await pizzasAd.findOneAndDelete({ _id: pizzaAdId }).then((response) => {
			if(response) {
        try {
          fs.unlinkSync(`${__dirname}/../../uploads/${response.thumbnail}`);

          return res.status(200).send("The pizza addition and its thumbnail have been deleted!");
        } catch(e){
          return res.status(200).send("The pizza addition have been deleted, but the thumbnail was not found");
        }
			} else {
				return res.status(400).send("Pizza addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
  
  //	Return all pizza additions
	async allPizzaAdditions(req, res) {
		await pizzasAd.find().sort({ 
      name: "asc", 
      price: "asc", 
      creationDate: "asc" 
    }).then((response) => {
			if(response && response.length) {
        return res.status(200).json(response);
			} else {
				return res.status(400).send("Pizza additions not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};