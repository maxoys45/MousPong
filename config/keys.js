// const db = 'mongodb+srv://maxoys45:Mongoys2k20@mouspong-v85w0.mongodb.net/db?retryWrites=true&w=majority'
const db = 'mongodb+srv://maxoys45:Mongoys2k20@mouspong-v85w0.mongodb.net/db_dev?retryWrites=true&w=majority'
// const db = 'mongodb://localhost:27017/mouspong'

module.exports = process.env.MONGODB_URL || db
