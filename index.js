const express = require('express')
const morgan = require("morgan")
const cors = require('cors')

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

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :response-time ms :body'))
app.use(express.static('dist'))

// data hoes here for now 
let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// basic routes

app.get('/info', (req, res) => {
  const d = Date()
  const date = d.toLocaleString('en-US')

  res.send(`<p>Phonebook has info for ${phonebook.length} people <br/> ${date}</p>`)
})

app.get('/api/phonebook', (req, res) => {
  res.json(phonebook)
})

app.get('/api/phonebook/:id', (req, res) => {
  const id = Number(req.params.id)
  const phoneNumber = phonebook.find(pb => {return pb.id === id})

  if (phoneNumber) {
    res.json(phoneNumber)
  } else {
    res.status(404).end()
  }

})

// generates random number id 
const generateID = (min, max) => {
  
  const id = Math.random() * (max - min)
  return Math.round(id)
}

app.post('/api/phonebook', (req, res) => {
  const {name, number} = req.body
  const id = generateID(0, 999)
  const newNumber = {
    id: id,
    name: name, 
    number: number
  }

  if ( newNumber.name || newNumber.number === undefined ) {
    return res.status(406)
      .json({ message: 'Data is incomplete' })
      .end()
  }

  phonebook.forEach(pb => {
    if (pb.name === newNumber.name) {
      return res.status(404)
      .json( {message: "The user name already exists" })
      .end()

    } else {
      phonebook = phonebook.concat(newNumber)
      return res.status(201).json(newNumber)

    }
  })

})

app.delete('/api/phonebook/:id', (req, res) => {
  const id = req.params.id

  phonebook = phonebook.filter(pb => pb.id !== id)

  res.status(204).end()

})

app.get('/', (request, response) => {
  response.send('Hellow World')
})

// middleware position is important
app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`)
})
