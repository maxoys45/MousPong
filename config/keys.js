// const db = 'mongodb+srv://[USERNAME]:[PASSWORD]@mouspong-v85w0.mongodb.net/db?retryWrites=true&w=majority'
// const db = 'mongodb+srv://[USERNAME]:[PASSWORD]@mouspong-v85w0.mongodb.net/db_dev?retryWrites=true&w=majority'
const db = 'mongodb+srv://[USERNAME]:[PASSWORD]@mouspong-v85w0.mongodb.net/db_elo?retryWrites=true&w=majority'
// const db = 'mongodb://localhost:27017/mouspong'
// const db = 'mongodb://localhost:27017/mouspong_remove'
// const db = 'mongodb://localhost:27017/mouspong_elo'
// const db = 'mongodb://localhost:27017/mouspong_delete'

module.exports = process.env.MONGODB_URL || db
