import {Sequelize, DataType} from "sequelize-typescript";
import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}))

const sequelize = new Sequelize({
    dialect:'sqlite',
    storage: 'db.sqlite',
});

const Gage = sequelize.define('gage', {
    name: DataType.STRING,
    siteId: DataType.STRING,
    source: DataType.STRING
}, {
    timestamps: true
})

sequelize.sync({force: false})

app.post('/gage', (req,res) => {
    Gage.create(req.body).then(result => {
        console.log(result)
        res.send(result)
    }).catch(e => {
        console.error(e)
        res.send('failure').status(500)
    })
})

app.get('/gage', (req, res) => {
    Gage.findAll().then(results => {
        res.send(results)
    }).catch(e => {
        console.error(e)
        res.send(e)
    })
})

app.get('/', async (req, res) => {
    res.send('hello world')
})

const server = app.listen(3001, () => console.log('express server listening'))

module.exports = app
