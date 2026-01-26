const { MongoClient } = require("mongodb");

const url = "mongodb+srv://insomny:Icanflyeveryday@cluster0.16lehun.mongodb.net/?appName=Cluster0"; 
const dbName = "assignment3";

let db;

async function connectDB() {
  if (db) return db;

  try {
    const client = new MongoClient(url);
    await client.connect();          
    db = client.db(dbName);
    console.log("Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);                  
  }
}

module.exports = connectDB;
