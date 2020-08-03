//  Requiring database
const mongoose = require("mongoose");

//	Loading Hamburger Additions collection from database
require("../models/HamburgerAddition");
const hamburgersAd = mongoose.model("HamburgerAdditions");

// Loading module for to delete uploads
const fs = require("fs");
const { promisify } = require("util");
const asyncUnlink = promisify(fs.unlink);

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
      (async () => {
        try {
          await asyncUnlink(`${__dirname}/../../uploads/${filename}`);
          console.log("New thumbnail has been deleted!");
        } catch(e){
          console.log("New thumbnail was not found");
        }
      })();

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
        (async () => {
          try {
            await asyncUnlink(`${__dirname}/../../uploads/${filename}`);
            console.log("New thumbnail has been deleted!");
          } catch(e){
            console.log("New thumbnail was not found");
          }
        })();

        return res.status(400).send("We couldn't create a new hamburger addition, try again later!");
      }
    }).catch((error) => {
      (async () => {
        try {
          await asyncUnlink(`${__dirname}/../../uploads/${filename}`);
          console.log("New thumbnail has been deleted!");
        } catch(e){
          console.log("New thumbnail was not found");
        }
      })();

      return res.status(500).send(error);
    });
	},
  
  //	Update a specific hamburger addition
  async update(req, res) {
    const hamburgerAdId = req.params.id;
    
    const { name, price } = req.body;
    const filename = (req.file) ? req.file.filename : null;

    if(!name || !name.length || !price) {
      (async () => {
        try {
          await asyncUnlink(`${__dirname}/../../uploads/${filename}`);
          console.log("New thumbnail has been deleted!");
        } catch(e){
          console.log("New thumbnail was not found");
        }
      })();

      return res.status(400).send("Name or price are empty!");

    } else {
      await hamburgersAd.findOne({ _id: hamburgerAdId }).then((hamburgerAd) => {
        if(hamburgerAd) {
          (async () => {
            try {
              await asyncUnlink(`${__dirname}/../../uploads/${hamburgerAd.thumbnail}`);
              console.log("Thumbnail old has been deleted!");
            } catch(e){
              console.log("Thumbnail old was not found");
            }
          })();
        } else {
          return res.status(400).send("Hamburger addition not found!");
        }
      }).catch((error) => {
        return res.status(500).send(error);
      });
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
        (async () => {
          try {
            await asyncUnlink(`${__dirname}/../../uploads/${response.thumbnail}`);
            return res.status(200).send("The Hamburger addtion and thumbnail has been deleted!");
          } catch(e){
            return res.status(500).send("The hamburger addtion was deleted, but the thumbnail was not found");
          }
        })();
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