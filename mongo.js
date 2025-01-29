const mongoose = require('mongoose')



const password = process.argv[2]

const url = `mongodb+srv://PhonebookUser:${password}@fullstackopen.7u8fr.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=FullStackOpen`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const PersonSchema = new mongoose.Schema({
    name: String,
    number:String
})

const Person = mongoose.model('Person', PersonSchema)

const person = new Person({
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456'
})

// person.save().then(result => {
//     console.log('number saved')
//     mongoose.connection.close()
// })

if(process.argv.length<3) {
    console.log('Give password as argument')
    process.exit(1)
}

if(process.argv.length===3){
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close
    })
}

if(process.argv.length>=4) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    person.save().then(result =>{
        console.log(`Added ${person.name}'s number ${person.number} to phonebook`)
    })
}
