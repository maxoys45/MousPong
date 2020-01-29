const prod = 'mongodb+srv://maxoys45:Mongoys2k20@mouspong-v85w0.mongodb.net/db?retryWrites=true&w=majority'
const dev = 'mongodb://localhost:27017/mouspong'

module.exports = process.env.MONGODB_URL || dev
