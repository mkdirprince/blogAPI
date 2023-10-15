require('dotenv').config()
const express = require("express")
const app = express()
const cors = require('cors')
const Blog = require('./models/blog')


const requestLogger = (request, response, next) => {
  console.log("method:", request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log("---")
  next()
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === "CastError"){
    return response.status(400).send({ error: "malformated id" })
  }

  else if (error.name === "validationError") {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint " })
}

app.use(express.json())
app.use(cors())
app.use(requestLogger)


app.get('/api/blog', (request, response) => {
  Blog.find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.get('/api/blog/:id', (request, response, next) => {

  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      }

      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/blog', (request, response, next) => {
  const body = request.body

  if (!body) {
    response.status(400).json({ error: 'content missing' })
  }

  const blog = new Blog ({
    content: body.content,
    tag: body.tag
  })

  blog.save()
    .then(savedBlog => {
      response.json(savedBlog)
    })
    .catch(error => next(error))

})

app.put('/api/blog/:id', (request, response, next) => {

  const { content, tag } = request.body

  Blog.findByIdAndUpdate(request.params.id, { content, tag }, { new: true, runValidators: true, context: "query" })
    .then( updatedBlog => {
      response.json(updatedBlog)
    })
    .catch (error => next(error))

})

app.delete('/api/blog/:id', (request, response, next) => {

  Blog.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch( error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})