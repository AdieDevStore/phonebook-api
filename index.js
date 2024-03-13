require('dotenv').config()
const express = require('express')
const morgan = require("morgan")
const cors = require('cors')
const Contact = require('./mongo.cjs')

// morgan config

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

const logger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})

const app = express()
const PORT = process.env.PORT || 3000

// example of middleware 
// now redundant - usiong Morgan
const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:', req.path)
  console.log('Body:', req.body)
  console.log('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint'}) 
}

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :response-time ms :body'))
app.use(express.static('dist'))

app.get('/api/phonebook', (req, res) => {
  
  Contact.find({})
    .then(notes => {
      res.status(200).json(notes)
  })

})

app.post('/api/phonebook', async (req, res) => {
  const newContact = new Contact({
    name: req.body.name,
    number: req.body.number
  })

  if (!newContact.name || !newContact.number) {
    res.status(412).json({msg: 'no data recevied'})
  } else {
    newContact.save()
      .then(result => {
        console.log(result)
        res.status(203).json(newContact)
      })
      .catch(err => {
        console.log('An error occured', err.message)
        res.status(500)
      })
  }

})

app.delete('/api/phonebook/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id)
    res.sendStatus(204)
  } catch (error) {
    console.log(error)
  }
})

// middleware position is important
app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`)
})
