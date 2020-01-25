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
      type: Number
    },
    won: {
      type: Number
    },
    lost: {
      type: Number
    },
    points: {
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