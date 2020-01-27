import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  stats: {
    played: {
      type: Number,
      default: 0,
    },
    won: {
      type: Number,
      default: 0,
    },
    lost: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    winningPercent: {
      type: Number
    }
  },
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    }
  ]
})

export const User = mongoose.model('User', UserSchema)