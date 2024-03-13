const mongoose = require('mongoose')

const URI = process.env.MONGO_URI

mongoose.set('strictQuery', true)
mongoose.connect(URI)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(err => {
    console.log('Error connecting to DB', err.message)
  })

const contactSchema = mongoose.Schema({
  name: String, 
  number: String, 
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)







