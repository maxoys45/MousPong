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
    }
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
    }
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