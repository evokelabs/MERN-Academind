const uuid = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484445,
      lng: -73.9856646
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
]

const getPlacesById = (req, res, next) => {
  const placeId = req.params.pid
  const places = DUMMY_PLACES.find(p => {
    return p.id === placeId
  })
  if (!places) {
    throw new HttpError('Could not find place for the provided user id.', 404)
  }
}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid
  const places = DUMMY_PLACES.filter(p => {
    return p.creator === userId
  })
  if (!places || places.length === 0) {
    const error = new Error('Could not find place!')
    error.code = 404
    return next(error)
  }
  res.json({ places })
}

const createPlace = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return new HttpError('Invalid inputs passed, please check your data.', 422)
  }
  const { title, description, address, creator } = req.body

  const coordinates = getCoordsForAddress(address)

  const createdPlace = {
    id: uuid(),
    title,
    description,
    address,
    location: coordinates,
    creator
  }
  DUMMY_PLACES.push(createdPlace)
  res.status(201).json({ place: createdPlace })
}

const updatePlace = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422)
  }
  const { title, description } = req.body
  const placeId = req.params.pid

  const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
  updatedPlace.title = title
  updatePlace.description = description

  DUMMY_PLACES[placeIndex] = updatedPlace

  res.status(200).json({ place: updatedPlace })
}

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid
  if (DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could not find place for the provided user id.', 404)
  }
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)
  res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlacesById = getPlacesById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace