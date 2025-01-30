require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))
app.use(cors())

morgan.token('printPost', (req) => req.printPost || '')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name==='CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  else if(error.name==='ValidationError') {
    return response.status(400).json({ error:error.message })
  }

  next(error)
}

app.use(assignPost)
app.use(morgan(':method :url :status :res[content-length] -:response-time -Phonebook entry: :printPost'))
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error:'Unknown endpoint' })
}

function assignPost (req, res, next) {
  req.printPost = JSON.stringify(req.body)
  next()

}

app.get('/', (request,response) => {
  response.send('Got to /api/persons for phonebook')
})


app.get('/info', (request,response,next) => {
  const requestTime = new Date()

  Person.countDocuments()
    .then(count => {
      response.send(`<h1> Phonebook has information of ${count} people </h1> 
            <p> ${requestTime} </p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request,response) => {
  Person.find({}).then(persons => {
    response.send(persons)
  })
})

app.get('/api/persons/:id', (request,response) => {

  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      }
      else {
        response.status(404).send('Person not found') /*don't use response.status(404).end, it doesnt work */
      }

    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error:'malformed id' })
    })
})

app.delete('/api/persons/:id',(request,response,next) => {

  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const newEntry = request.body

  if (!newEntry.name || !newEntry.number) {
    return response.status(400).json({
      error: 'Name or number is missing',
    })
  }


  Person.findOne({ name: newEntry.name })
    .then((duplicateFound) => {
      if (duplicateFound) {

        return response.status(400).json({
          error: 'Name must be unique',
        })
      }



      const newId = Math.floor(Math.random() * 1000)

      const person = new Person({
        id: newId.toString(),
        name: newEntry.name,
        number: newEntry.number,
      })

      return person.save()
    })
    .then((savedPerson) => {

      if (savedPerson) {
        response.json(savedPerson)
      }
    })
    .catch((error) => next(error))


})



app.put('/api/persons/:id', (request, response, next) => {
  const body= request.body

  const updateNumber ={
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, updateNumber,{ new:true, runValidators:true })
    .then(updatedNumber => {
      if(updatedNumber) {
        response.json(updatedNumber)
      }
      else{
        response.status(404).json({ error:'Person not in phonebook' })
      }
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})