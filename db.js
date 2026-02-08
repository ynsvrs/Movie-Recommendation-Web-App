require('dotenv').config();  
const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URI;  
let db;

async function connectDB() {
  if (db) return db;

  try {
    console.log("MONGO_URI =", process.env.MONGO_URI);
    const client = new MongoClient(url);
    await client.connect();          
    db = client.db("MovieRec"); 
    console.log("Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);                  
  }
}

module.exports = connectDB;
