//  Requiring database
const mongoose = require("mongoose");

//	Loading Hamburger Additions collection from database
require("../models/HamburgerAddition");
const hamburgersAd = mongoose.model("HamburgerAdditions");

//	Exporting Pizza Addition features
module.exports = {
	//	Return a pizza addition on database given id
	async index(req, res) {
    const hamburgerAdId = req.params.id;
		
		await hamburgersAd.findOne({ _id: hamburgerAdId }).then((hamburgerAd) => {
			if(hamburgerAd) {
				return res.status(200).json(hamburgerAd);
			} else {
				return res.status(400).send("Hamburger addition not found!");
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
      await hamburgersAd.create({
        name,
        price,
        thumbnail: filename
      }).then((response) => {
        if(response) {
          return res.status(201).send("Hamburger addition created successfully!");
        } else {
          return res.status(400).send("We couldn't create a new hamburger addition, try again later!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    } else {
      return res.status(400).send("Name or price are empty!");
    }
	},
  
  //	Update a specific pizza addition
  async update(req, res) {
    const hamburgerAdId = req.params.id;
    
    const { name, price } = req.body;
    const { filename } = req.file;

    if(name && name.length && price){
      await hamburgersAd.findOneAndUpdate({ _id: hamburgerAdId }, {
        name,
        price,
        thumbnail: filename
      }).then((response) => {
        if(response) {
          return res.status(200).send("The hamburger addition has been updated!");
        } else {
          return res.status(400).send("Hamburger addition not found!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
    } else {
      return res.status(400).send("Name or price are empty!");
    }
	},
  
  //	Delete a specific pizza addition
	async delete(req, res) {
		const hamburgerAdId = req.params.id;

		await hamburgersAd.findOneAndDelete({ _id: hamburgerAdId }).then((response) => {
			if(response) {
				return res.status(200).send("The hamburger addition has been deleted!");
			} else {
				return res.status(400).send("Hamburger addition not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}


}