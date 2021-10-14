import * as cron from 'node-cron'
import {Sequelize, DataTypes} from "sequelize";
import sqlite3 from 'sqlite3'
import express from 'express'
import axios from 'axios'
import cors from 'cors'

const app = express()
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}))

const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    dialectModule: sqlite3,
    host: 'localhost',
    storage: __dirname + '/db.sqlite',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const Gage = sequelize.define('gage', {
    name: DataTypes.STRING,
    siteId: DataTypes.STRING,
    source: DataTypes.STRING,
    reading: DataTypes.INTEGER,
    delta: DataTypes.INTEGER,
}, {
    timestamps: true
});

console.log('one');
(async function () {
    console.log('two')
    await sequelize.sync({force: false})
})()


console.log('three')

app.post('/gage', (req,res) => {
    Gage.create(req.body).then(result => {
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

app.delete('/gage', async (req, res) => {
    await Gage.destroy({
        where: {
            id: req.query.id
        }
    }).then(() => {
        res.send(req.query.id)
    }).catch(e => {
        console.error(e)
        res.send('Something went wrong...')
    })
})

app.get('/', async (req, res) => {
    res.send('hello world')
})

const server = app.listen(3001, () => console.log('express server listening'))

const oneMinInterval = '*/1 * * * *'
// const twoMinInterval = '*/2 * * * *'
// const fiveMinInterval = '*/5 * * * *'

cron.schedule(oneMinInterval, async () => {
    const gages = await Gage.findAll()
    let gageSiteIds = ''
    gages.forEach( (g) => {
        gageSiteIds += g.getDataValue('siteId') + ','
    })


    const result = await axios.get(`http://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gageSiteIds}&parameterCd=00060,00065,00010&siteStatus=all`)

    console.log(result)

});

// http://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gageIds}&parameterCd=00060,00065,00010&siteStatus=all

module.exports = app
