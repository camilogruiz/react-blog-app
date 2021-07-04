const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

const events = []

app.post('/events', (req, res) => {
  const event = req.body

  events.push(event)

  axios.post('https://posts-clusterip-srv:4000/events', event)
  axios.post('https://comments-srv:4001/events', event)
  axios.post('https://query-srv:4002/events', event)
  axios.post('https://moderation-srv:4003/events', event)

  res.send({ status: 'OK' })
})

app.get('/events', (req, res) => {
  res.send(events)
})

app.listen(4005, () => {
  console.log('Listening on port 4005')
})
