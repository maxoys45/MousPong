import mongoose from 'mongoose'

const MatchSchema = new mongoose.Schema({
  _player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player1score: {
    type: Number,
    required: true,
  },
  _player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2score: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

export const Match = mongoose.model('Match', MatchSchema)