const express = require('express')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(express.json())
app.use(cors())

const commentsByPostsId = {}

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostsId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex')
  const { content } = req.body

  const comments = commentsByPostsId[req.params.id] || []

  comments.push({ id: commentId, content, status: 'pending' })

  commentsByPostsId[req.params.id] = comments

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      status: 'pending',
      postId: req.params.id
    }
  })

  res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
  console.log('Recieved Event:', req.body.type)
  const { type, data } = req.body

  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data
    const comments = commentsByPostsId[postId]
    const comment = comments.find(comment => { return comment.id === id })
    comment.status = status

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        content,
        status,
        postId
      }
    })
  }

  res.send({})
})

app.listen(4001, () => {
  console.log('Listening on port 4001')
})
