const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistAccountCpf(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).send({ error: "account not found!" });
  }

  req.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((accumulator, operation) => {
    if (operation.type === "credit") {
      return accumulator + operation.amount;
    } else {
      return accumulator - operation.amount;
    }
  }, 0);

  return balance;
}

// cpf
// name
// id
// statement

app.post("/account", (req, res) => {
  const { name, cpf } = req.body;

  const cpfAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (cpfAlreadyExists) {
    return res.status(400).send({ error: "account already exists!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return res.status(201).send();
});

app.get("/statement/", verifyIfExistAccountCpf, (req, res) => {
  const { customer } = req;

  return res.status(200).send(customer);
});

app.post("/deposit", verifyIfExistAccountCpf, (req, res) => {
  const { description, amount } = req.body;

  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.post("/withdraw", verifyIfExistAccountCpf, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).send({ error: "Founds not enough!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.get("/statement/date", verifyIfExistAccountCpf, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return res.status(200).send(statement);
});

app.put("/account", verifyIfExistAccountCpf, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).send(customer);
});

app.delete("/account", verifyIfExistAccountCpf, (req, res) => {
  const { customer } = req;

  customers.splice(customer, 1);

  return res.status(200).send({ customers });
});

app.get("/balance", verifyIfExistAccountCpf, (req, res) => {
  const { customer } = req;

  const balance = getBalance(customer.statement);

  return res.send({ balance });
});

module.exports = app;
