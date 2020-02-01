import mongoose from 'mongoose'

const MatchSchema = new mongoose.Schema({
  p1: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    winner: {
      type: Boolean,
      required: true,
    },
  },
  p2: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    winner: {
      type: Boolean,
      required: true,
    },
  },
  overtime: {
    type: Boolean,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

export const Match = mongoose.model('Match', MatchSchema)