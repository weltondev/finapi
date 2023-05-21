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
		return res.status(400).send({ error: 'cpf already exists!' })
	}

	customers.push({
		cpf,
		name,
		id: uuidv4(),
		statement: []
	})

	return res.status(201).send()
})



module.exports = app