//  Requiring database
const mongoose = require("mongoose");

//	Loading Hamburger Additions collection from database
require("../models/HamburgerAddition");
const hamburgersAd = mongoose.model("HamburgerAdditions");

//	Exporting Hamburger Addition features
module.exports = {
	//	Return a hamburger addition on database given id
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

  //	Create a new hamburger addition
	async create(req, res) {
    const { name, price } = req.body;
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !price) {
      return res.status(400).send("Name or price are empty!");
    }

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
	},
  
  //	Update a specific hamburger addition
  async update(req, res) {
    const hamburgerAdId = req.params.id;
    
    const { name, price } = req.body;
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !price) {
      return res.status(400).send("Name or price are empty!");
    }

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
	},
  
  //	Delete a specific hamburger addition
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
	},
  
  //	Return all hamburgers
	async allHamburgerAdditions(req, res) {
		await hamburgersAd.find().sort({ 
      name: "asc", 
      price: "asc", 
      creationDate: "asc" 
    }).then((response) => {
			if(response && response.length) {
        return res.status(200).json(response);
			} else {
				return res.status(400).send("Hamburger additions not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};