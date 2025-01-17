const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))
app.use(cors())

morgan.token('printPost', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
})

app.use(assignPost)
app.use(morgan(':method :url :status :res[content-length] -:response-time -Phonebook entry: :printPost'))

let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

function assignPost (req, res, next) {
    printPost = JSON.stringify(req.body)
    next()
  
}

app.get('/', (request,response) => {
  response.send('Got to /api/persons for phonebook')
})


app.get('/info', (request,response) => {
    const requestTime= new Date()
    const countEntries = persons.length

    response.send(`<h1> Phonebook has info for ${countEntries} people </h1>
                  <p> ${requestTime} </p>`
    )
})

app.get('/api/persons', (request,response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request,response) => {
    const id = request.params.id
    const person= persons.find(person => person.id===id)
    if(person){
      response.json(person)  
    }
    else {
      response.status(404).send('Person not found') /*don't use response.status(404).end, it doesnt work */
    }
    
})

app.delete('/api/persons/:id',(request,response) => {
    const id = request.params.id
    persons= persons.filter(person=> person.id!==id)

    response.status(204).send('Entry deleted')
})

app.post('/api/persons/',(request,response) => {
  const newEntry= request.body
  console.log('New entry in the phonebook:',newEntry)

  if(!newEntry.name || !newEntry.number)
  {
    return response.status(400).json({
      error: 'Name or number is missing'
    })
  }

  const checkName = persons.find(person => person.name === newEntry.name)

  if(checkName) {
    return response.status(400).json({
      error: 'Name must be unique'
    })
  }

  const newId = Math.floor(Math.random()*1000)
  const person= {
    id: newId.toString(),
    name: newEntry.name,
    number: newEntry.number
  }

  persons= persons.concat(person)

  response.json(person)

})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})