const mongoose = require('mongoose')


const connectDB = async() => {
    try{
        const mongoUri = process.env.MONGODB_URI || process.env.MONGOURL || 'mongodb://127.0.0.1:27017/mini-bank-app';
        await mongoose.connect(mongoUri, {serverSelectionTimeoutMS: 5000})
        console.log("MongoDB connected")
    } catch(error){
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB