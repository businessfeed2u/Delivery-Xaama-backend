//  Loading database module
const mongoose = require("mongoose");

//	Loading Addition schema and Additions collection from database
require("../models/Addition");
const additions = mongoose.model("Additions");

// Loading module to delete uploads
const fs = require("fs");

// Loading helpers
const regEx = require("../helpers/regEx");
const lang = require("../helpers/lang");

//	Chosen language
const cLang = "ptBR";

// Loading dirname
const path = require("path");
var __dirname = path.resolve();

//	Exporting Addition features
module.exports = {
	//	Return an addition on database given id
	async index(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			return res.status(400).send(lang[cLang]["invAdditionId"]);
		}

		await additions.findById(additionId).then((addition) => {
			if(addition) {
				return res.status(200).json(addition);
			} else {
				return res.status(404).send(lang[cLang]["nFAddition"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new addition
	async create(req, res) {
		const { name, type, price } = req.body;
		const filename = (req.file) ? req.file.filename : null;
		var errors = [];

		if(!name || !name.length) {
			errors.push(lang[cLang]["invAdditionName"]);
		}

		if(!type || !type.length || !regEx.seq.test(type)) {
			errors.push(lang[cLang]["invAdditionType"]);
		}

		if(!price || !price.length || !regEx.price.test(price)) {
			errors.push(lang[cLang]["invAdditionPrice"]);
		}

		if(errors.length) {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(error) {
          return res.status(500).send(error);
        }
      }

			const message = errors.join(", ");

      return res.status(400).send(message);
		}

		await additions.create({
			name,
			type: type.split(",").map(t => t.trim().toLowerCase()),
			price,
			thumbnail: filename
		}).then((response) => {
			if(response) {
				return res.status(201).send(lang[cLang]["succAdditionCreate"]);
			} else {
        if(filename) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${filename}`);
          } catch(error) {
            return res.status(500).send(error);
          }
        }
        return res.status(400).send(lang[cLang]["failAdditionCreate"]);
			}
		}).catch((error) => {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(e) {
          return res.status(500).send(e);
        }
      }
      return res.status(500).send(error);
		});
	},

	//	Update a specific addition
	async update(req, res) {
		const additionId = req.params.id;
		const { name, type, price, available } = req.body;

		var errors = [];

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			errors.push(lang[cLang]["invAdditionId"]);
		}

		if(!name || !name.length) {
			errors.push(lang[cLang]["invAdditionName"]);
		}

		if(!type || !type.length || !regEx.seq.test(type)) {
			errors.push(lang[cLang]["invAdditionType"]);
		}

		if(!price || !regEx.price.test(price)) {
			errors.push(lang[cLang]["invAdditionPrice"]);
		}

		if(errors.length) {
			const message = errors.join(", ");

			return res.status(400).send(message);
		}

		await additions.findByIdAndUpdate(additionId, {
			name,
			type: type.split(",").map(t => t.trim().toLowerCase()),
			price,
			available: available
		}).then((response) => {
			if(response) {
				return res.status(200).send(lang[cLang]["succAdditionUpdate"]);
			} else {
				return res.status(404).send(lang[cLang]["nFAddition"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Update a specific addition
	async updateThumbnail(req, res) {
		const additionId = req.params.id;
		const filename = (req.file) ? req.file.filename : null;

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(error) {
          return res.status(500).send(error);
        }
      }
      return res.status(400).send(lang[cLang]["invAdditionId"]);
		}

		await additions.findByIdAndUpdate(additionId, {
			thumbnail: filename
		}).then((response) => {
			if(response) {
        if(response.thumbnail) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${response.thumbnail}`);
          } catch(error) {
            return res.status(200).send(lang[cLang]["succAdditionUpdateButThumb"]);
          }
        }
        return res.status(200).send(lang[cLang]["succAdditionUpdateThumb"]);

			} else {
        if(filename) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${filename}`);
          } catch(error) {
            return res.status(500).send(error);
          }
        }
        return res.status(404).send(lang[cLang]["nFAddition"]);
			}
		}).catch((error) => {
      if(filename) {
        try {
          fs.unlinkSync(`${__dirname}/uploads/${filename}`);
        } catch(e) {
          return res.status(500).send(e);
        }
      }
      return res.status(500).send(error);
		});
	},

	//	Delete a specific addition
	async delete(req, res) {
		const additionId = req.params.id;

		if(!additionId || !additionId.length || !mongoose.Types.ObjectId.isValid(additionId)) {
			return res.status(400).send(lang[cLang]["invAdditionId"]);
		}

		await additions.findByIdAndDelete(additionId).then((response) => {
			if(response) {
        if(response.thumbnail) {
          try {
            fs.unlinkSync(`${__dirname}/uploads/${response.thumbnail}`);
          } catch(e){
            return res.status(200).send(lang[cLang]["succAdditionDeleteButThumb"]);
          }
        }
        return res.status(200).send(lang[cLang]["succAdditionDelete"]);
			} else {
				return res.status(404).send(lang[cLang]["nFAddition"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},

	//	Return all additions additions
	async all(req, res) {
		await additions.find().sort({
			type: "asc",
			available: "desc",
			name: "asc",
			price: "asc",
			creationDate: "asc"
		}).then((response) => {
			if(response && response.length) {
				return res.status(200).json(response);
			} else {
				return res.status(404).send(lang[cLang]["nFAdditions"]);
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};