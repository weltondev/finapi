const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(express.json())

const customers = [];

// cpf
// name
// id
// statement

app.post("/account", (req, res) => {
	const { name, cpf } = req.body;

	const cpfAlreadyExists = customers.some( customer => customer.cpf === cpf);

	if(cpfAlreadyExists) {
		return res.status(400).send({ error: 'account already exists!' })
	}

	customers.push({
		cpf,
		name,
		id: uuidv4(),
		statement: []
	})

	return res.status(201).send()
})

app.get("/statement/", (req, res) => {

	const { cpf } = req.headers;

	const customer = customers.find( customer => customer.cpf === cpf)

	if(!customer) {
		return res.status(400).send({ error: 'account not found!' })
	}

	return res.status(200).send(customer)

})

module.exports = app