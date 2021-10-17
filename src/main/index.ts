import * as cron from 'node-cron'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import * as http from 'http'
import { gages } from './allGages'
import { Gage, Reading, Alert, USGSFetchSchedule } from './database'
import { Server } from 'socket.io'
import { CreateAlertDTO, USGSGageData } from '../types'
import * as socketEvents from '../socketEvents'
import { DateTime } from 'luxon'

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
)
const server = http.createServer(app)

server.listen(3001)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
})

app.get('/gage-sources', (req, res) => {
  const { state } = req.query
  const stateGages = gages.find((el) => el.state === state)
  res.send(stateGages)
})

io.on(socketEvents.CONNECTION, async (socket) => {
  const loadGages = async () => {
    const val = await Gage.findAll()
    socket.emit(socketEvents.LOAD_GAGES, val)
  }

  const loadAlerts = async () => {
    const val = await Alert.findAll({
      include: [
        {
          model: Gage,
          attributes: ['name'],
        },
      ],
    })
    socket.emit(socketEvents.LOAD_ALERTS, val)
  }

  socket.on(socketEvents.CONNECTION, async () => {
    await loadGages()
    await loadAlerts()
  })

  socket.on(socketEvents.ALERT_CREATED, (createAlertDto: CreateAlertDTO) => {
    Alert.create(createAlertDto)
      .then(async () => {
        await loadAlerts()
      })
      .catch((e) => {
        console.error(e)
        socket.emit(socketEvents.CREATE_ERROR)
      })
  })

  // @TODO CRUD with just sockets no express route handlers.
  app.post('/gage', (req, res) => {
    Gage.create(req.body)
      .then(async () => {
        await loadGages()
        res.sendStatus(200)
      })
      .catch((e) => {
        console.error(e)
        res.sendStatus(500)
      })
  })

  app.delete('/gage', async (req, res) => {
    await Gage.destroy({
      where: {
        id: req.query.id,
      },
    })
      .then(async () => {
        await loadGages()
        res.sendStatus(200)
      })
      .catch((e) => {
        console.error(e)
        res.send('Something went wrong...')
      })
  })

  const scheduleInterval = '*/1 * * * *' // one minute
  // const scheduleInterval = '*/2 * * * *' // two minutes
  // const scheduleInterval = '*/5 * * * *' // five minutes

  cron.schedule(scheduleInterval, async () => {
    const tooSoon = await USGSFetchSchedule.findOne({
      where: { id: 1 },
    })
      .then(async (result) => {
        if (result) {
          const nextFetch = result.getDataValue('nextFetch')
          console.log('nextFetch: ', nextFetch)
          return true
        } else {
          await USGSFetchSchedule.create({
            nextFetch: DateTime.local()
              .plus({
                minutes: 15,
              })
              .toISODate(),
          })
        }

        return false
      })
      .catch((e) => {
        console.error('error: ', e)
      })

    console.log('tooSoon: ', tooSoon)

    try {
      const gages = await Gage.findAll()

      if (!gages.length) return

      let gageSiteIds = ''
      gages.forEach((g, i) => {
        if (i + 1 === gages.length) {
          // last site ID should not have a comma
          gageSiteIds += g.getDataValue('siteId')
        } else {
          gageSiteIds += g.getDataValue('siteId') + ','
        }
      })

      let gageData: USGSGageData

      if (process.env.NODE_ENV === 'development') {
        gageData = require('./mockGageResponse.json')
      } else {
        gageData = await axios
          .get(
            `http://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gageSiteIds}&parameterCd=00060,00065,00010&siteStatus=all`
          )
          .then((res) => res.data)
      }

      const payload = gageData.value.timeSeries.map((item) => {
        const numberOfValues = item.values.length
        const latestReading = parseInt(
          item.values[numberOfValues - 1].value[0].value
        )
        const parameter = item.variable.variableCode[0].value

        let metric = ''
        let temperature = 0
        if (parameter === '00060') {
          metric = 'CFS'
        } else if (parameter === '00065') {
          metric = 'FT'
        } else if (parameter === '00010') {
          metric = 'TEMP'
          temperature = latestReading
        }

        const siteId = item.sourceInfo.siteCode[0].value
        const gageId = gages
          .find((item) => item.getDataValue('siteId') === siteId)
          .getDataValue('id')
        const { latitude, longitude } = item.sourceInfo.geoLocation.geogLocation

        return {
          latitude,
          longitude,
          siteId,
          gageId,
          metric,
          name: item.sourceInfo.siteName,
          reading: latestReading,
          // difference: !temperature ? (latest - old) : 0,
          tempC: temperature,
          tempF: temperature ? temperature * 1.8 + 32 : null,
        }
      })

      await Promise.all(
        payload.map(async (el) => {
          await Gage.update(
            {
              ...el,
              lastFetch: new Date(), // this should come from USGS API
            },
            {
              where: {
                id: el.gageId,
              },
            }
          )

          await Reading.create({
            ...el,
            gageId: el.gageId,
          })
        })
      )

      await loadGages()

      await USGSFetchSchedule.update(
        {
          nextFetch: DateTime.local()
            .plus({
              minutes: 15,
            })
            .toISODate(),
        },
        {
          where: { id: 1 },
        }
      )
    } catch (e) {
      console.log('e', e)
    }
  })
})

module.exports = app
