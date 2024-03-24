require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Contact = require('./mongo.cjs');

// Morgan body logger
morgan.token('body', (req) => JSON.stringify(req.body));

const app = express();
const PORT = process.env.PORT || 3000;

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :response-time ms :body'));
app.use(express.static('dist'));

app.get('/api/phonebook', (req, res) => {
  Contact.find({})
    .then((notes) => {
      res.status(200).json(notes);
    });
});

app.post('/api/phonebook', async (req, res) => {
  const newContact = new Contact({
    name: req.body.name,
    number: req.body.number,
  });

  if (!newContact.name || !newContact.number) {
    res.status(412).json({ msg: 'no data recevied' });
  } else {
    newContact.save()
      .then((result) => {
        console.log(result);
        res.status(203).json(newContact);
      })
      .catch((err) => {
        console.log('An error occured', err.message);
        res.status(500);
      });
  }
});

app.get('/api/phonebook/:id', (req, res) => {
  Contact.findById(req.params.id)
    .then((resp) => { res.status(200).json(resp); });
});

app.patch('/api/phonebook/:id', (req, res) => {
  const { id } = req.params;
  const contact = {
    name: req.body.name,
    number: req.body.number,
  };

  Contact.findByIdAndUpdate(id, contact, { new: true })
    .then((response) => {
      res.status(203).json(response);
    })
    .catch((error) => console.log(error));
});

app.delete('/api/phonebook/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
  }
});

// middleware position is important
app.use(unknownEndpoint);

app.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
});
