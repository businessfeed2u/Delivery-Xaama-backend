//  Requiring database
const mongoose = require("mongoose");

//	Loading Company collection from database
require("../models/Company");
const companyData = mongoose.model("Company");

// Loading module to delete uploads
const fs = require("fs");

//	Exporting Admin features
module.exports = {
	//	Create or update company data
	async manageCompanyData(req, res) {
		const { name, email, phone, address, freight, productTypes } = req.body;
		const filename = (req.file) ? req.file.filename : null;

      if(!name || !name.length || !email || !email.length 
        || !phone || !phone.length || !address || !address.length 
        || !freight || !productTypes) {
      
          if(filename) {
            fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
          }

        return res.status(400).send("Name, email, phone, address, freight or product types are empty!");
		}

		await companyData.findOneAndUpdate({}, {
			name,
			email,
			phone,
			address,
      freight,
			productTypes: productTypes.split(",").map(productType => productType.trim().toLowerCase()),
      logo: filename
		}).then((response) => {
			if(response) {
				try {
					fs.unlinkSync(`${__dirname}/../../uploads/${response.logo}`);
				} catch(error) {
					//
				}

				return res.status(200).send("The company data has been updated!");
			} else {
				companyData.create({ 
					name,
					email,
					phone,
					address,
          freight,
          productTypes: productTypes.split(",").map(productType => productType.trim().toLowerCase()),
					logo: filename
				}).then((company) => {
					if(company) {
						return res.status(201).json(company);
					} else {
						if(filename) {
							fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
						}

						return res.status(400).send("We couldn't process your request, try again later!");
					}
				}).catch((error) => {
					if(filename) {
						fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
					}

					return res.status(500).send(error);
				});
			}
		}).catch((error) => {
      if(filename) {
        fs.unlinkSync(`${__dirname}/../../uploads/${filename}`);
      }
			return res.status(500).send(error);
		});
	}
};