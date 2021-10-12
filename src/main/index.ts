import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: 'http://localhost:3000'
}))

app.get('/', (req, res) => {
    res.send('hello world')
})

const server = app.listen(3001, () => console.log('express server listening'))

module.exports = app