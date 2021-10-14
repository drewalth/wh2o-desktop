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

const Alert = sequelize.define('alert', {
    name: DataTypes.STRING,
    criteria: DataTypes.STRING,
    minimum: DataTypes.INTEGER,
    maximum: DataTypes.INTEGER,
    value: DataTypes.INTEGER
}, {
    timestamps: true
})

const Reading = sequelize.define('reading', {
    value: DataTypes.INTEGER,
    metric: DataTypes.STRING
}, {
    timestamps: true
})

const Gage = sequelize.define('gage', {
    name: DataTypes.STRING,
    siteId: DataTypes.STRING,
    source: DataTypes.STRING,
    metric: DataTypes.STRING,
    reading: DataTypes.INTEGER,
    delta: DataTypes.INTEGER,
}, {
    timestamps: true
});

Gage.hasMany(Reading)
Gage.hasMany(Alert)
Reading.belongsTo(Gage)
Alert.belongsTo(Gage)

;(async function () {
    await sequelize.sync({force: false})
})()

app.post('/gage', (req, res) => {
    Gage.create(req.body).then(result => {
        res.send(result)
    }).catch(e => {
        console.error(e)
        res.send('failure').status(500)
    })
})

app.get('/gage', (req, res) => {
    Gage.findAll({
        include: [{
            model: Reading
        }, {
            model: Alert
        }]
    }).then(results => {
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

// const oneMinInterval = '*/1 * * * *'
// const twoMinInterval = '*/2 * * * *'
const fiveMinInterval = '*/5 * * * *'

cron.schedule(fiveMinInterval, async () => {
    try {
        const gages = await Gage.findAll()
        if (!gages.length) return

        let gageSiteIds = ''
        gages.forEach((g, i) => {

            if (i + 1 === gages.length) {
                gageSiteIds += g.getDataValue('siteId')
            } else {
                gageSiteIds += g.getDataValue('siteId') + ','
            }


        })


        const {data} = await axios.get(`http://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gageSiteIds}&parameterCd=00060,00065,00010&siteStatus=all`)

        // @ts-ignore
        const payload = data.value.timeSeries.map(item => {
            const numberOfValues = item.values.length
            const latestReading = parseInt(item.values[numberOfValues - 1].value[0].value)
            const parameter = item.variable.variableCode[0].value;

            let metric = '';
            let temperature = 0;
            if (parameter === '00060') {
                metric = 'CFS';
            } else if (parameter === '00065') {
                metric = 'FT';
            } else if (parameter === '00010') {
                metric = 'TEMP';
                temperature = latestReading;
            }

            const siteId = item.sourceInfo.siteCode[0].value;
            const gageId = gages.find((item) => item.getDataValue('siteId') === siteId).getDataValue('id');
            const {latitude, longitude} =
                item.sourceInfo.geoLocation.geogLocation;

            return {
                latitude,
                longitude,
                siteId,
                gageId,
                metric,
                name: item.sourceInfo.siteName,
                reading: latestReading,
                // difference: !temperature ? (latest - old) : 0,
                temperatureCelsius: temperature,
                temperatureFahrenheit: temperature ? temperature * 1.8 + 32 : null,
            };
        })


        await Promise.all(payload.map(async (el: any) => {
            await Gage.update({
                ...el,
                updatedAt: new Date()
            }, {
                where: {
                    id: el.gageId
                }
            })

            await Reading.create({
                ...el,
                gageId: el.gageId
            })
        }))


    } catch (e) {
        console.log('e', e)
    }

});

module.exports = app
