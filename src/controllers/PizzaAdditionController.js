//  Requiring database
const mongoose = require("mongoose");

//	Loading Pizza Additions collection from database
require("../models/PizzaAddition");
const pizzas = mongoose.model("PizzaAdditions");

//	Exporting Pizza Addition features
module.exports = {
	//	Return a pizza addition on database given id
	async index(req, res) {
    const pizzaAdId = req.params.id;
		
		await pizzas.findOne({ _id: pizzaAdId }).then((pizzaAd) => {
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
    const { filename } = req.file;

    if(name && name.length && price){
      await pizzas.create({
        name,
        price,
        thumbnail: filename
      }).then((response) => {
        if(response) {
          return res.status(201).send("Pizza addition created successfully!");
        } else {
          return res.status(400).send("We couldn't create a new pizza addition, try again later!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    } else {
      return res.status(400).send("Name or price are empty!");
    }
	},
  

}