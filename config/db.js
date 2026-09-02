const {Pool} = require('pg')
require('dotenv').config()

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Bagian ini sangat penting agar connectDB bisa dipanggil sebagai fungsi di server.js
module.exports = connectDB;