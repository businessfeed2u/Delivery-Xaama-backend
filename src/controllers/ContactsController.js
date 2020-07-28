//  Requiring database
const mongoose = require("mongoose");

//	Loading Contacts collection from database
require("../models/Contact");
const contacts = mongoose.model("Contatos");

//	Exporting Contacts features
module.exports = {
	//	Return a specific contact given id from current user
	async index(req, res) {
		const userId = req.headers.authorization;
		const contactId = req.params.id;
		
		await contacts.findOne({ _id: contactId, idUser: userId }).then((contact) => {
			if(contact) {
				return res.status(200).json(contact);
			} else {
				return res.status(400).send("Contact not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Create a new contact to current user
	async create(req, res) {
		req.body.idUser = req.headers.authorization;

		await contacts.create(req.body).then((response) => {
			if(response) {
				return res.status(201).send("Contact created successfully!");
			} else {
				return res.status(400).send("We couldn't create a new contact, try again later!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Update a specific contact from current user
	async update(req, res) {
		const userId = req.headers.authorization;
		const contactId = req.params.id;
		req.body.idUser = userId;

		await contacts.findOneAndUpdate({ _id: contactId, idUser: userId }, req.body).then((response) => {
			if(response) {
				return res.status(200).send("The contact have been updated!");
			} else {
				return res.status(400).send("Contact not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Delete a specific contact from current user
	async delete(req, res) {
		const userId = req.headers.authorization;
		const contactId = req.params.id;

		await contacts.findOneAndDelete({ _id: contactId, idUser: userId }).then((response) => {
			if(response) {
				return res.status(200).send("The contact have been deleted!");
			} else {
				return res.status(400).send("Contact not found!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Return all contacts from current user
	async user(req, res) {
		const userId = req.headers.authorization;

		await contacts.find({ idUser: userId }).sort({ name: "asc", surname: "asc" }).then((response) => {
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(400).send("Contacts not found for the user!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	},
	//	Return a list of contacts containing a specific word
	async search(req, res) {
		const userId = req.headers.authorization;
		const search_query = req.query.search_query;

		await contacts.find({ 
			idUser: userId, 
			$or: [{
				name: {
					$regex: '.*' + search_query + '.*',
					$options: "i"
				}}, {
				surname: {
					$regex: '.*' + search_query + '.*',
					$options: "i"
				}}
			]
		}).sort({ name: "asc", surname: "asc" }).then((response) => {
			if(response) {
				return res.status(200).json(response);
			} else {
				return res.status(400).send("Contacts not found for the search!");
			}
		}).catch((error) => {
			return res.status(500).send(error);
		});
	}
};