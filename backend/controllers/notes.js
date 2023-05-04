const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

//
// Summary: helper function for isolating the token from authorization header
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

// GET: get all notes
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)

  ////  Syntax without async/await
  // Note.find({}).then(notes => {
  //   response.json(notes)
  // })
})


// GET: get single note
notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)

  if(note) {
    response.json(note)
  } else {
    response.status(404).send()
  }

  //// Syntax without express-async-errors - parameters need to be this 'async (request, response, next)'
  // try {
  //   const note = await Note.findById(request.params.id)
  //   if(note) {
  //     response.json(note)
  //   } else {
  //     response.status(404).send()
  //   }
  // } catch (exception) {
  //   next(exception)
  // }


  ////  Syntax without async/await
  // Note.findById(request.params.id)
  //   .then(note => {
  //     if (note) {
  //       response.json(note)
  //     } else {
  //       response.status(404).end()
  //     }
  //   })
  //   .catch(error => next(error))
})


// POST: create note
notesRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedNote)

  //// Syntax without express-async-errors - parameters need to be this 'async (request, response, next)'
  // try {
  //   const savedNote = await note.save()
  //   response.status(201).json(savedNote)
  // } catch (exception) {
  //   next(exception)
  // }

  ////  Syntax without async/await
  // note.save()
  //   .then(savedNote => {
  //     response.json(savedNote)
  //   })
  //   .catch(error => next(error))
})


// DELETE: Delete note
notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()


  //// Syntax without express-async-errors - parameters need to be this 'async (request, response, next)'
  // try {
  //   await Note.findByIdAndRemove(request.params.id)
  //   response.status(204).end()
  // } catch (exception) {
  //   next(exception)
  // }

  ////  Syntax without async/await
  // Note.findByIdAndDelete(request.params.id)
  //   .then(() => {
  //     response.status(204).end()
  //   })
  //   .catch(error => next(error))

})


// PUT: Update note
notesRouter.put('/:id', async (request, response) => {
  const { content, important } = request.body

  const updatedNote =
    await Note.findByIdAndUpdate(request.params.id,
      { content, important },
      { new: true, runValidators: true, context: 'query' }
    )

  response.json(updatedNote)

////  Syntax without async/await
  // Note.findByIdAndUpdate(
  //   request.params.id,
  //   { content, important },
  //   { new: true, runValidators: true, context: 'query' }
  // )
  //   .then(updatedNote => {
  //     response.json(updatedNote)
  //   })
  //   .catch(error => next(error))
})

module.exports = notesRouter