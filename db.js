const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017"; // Локальный MongoDB
const dbName = "assignment3";

let db;

async function connectDB() {
  if (db) return db;

  try {
    const client = new MongoClient(url);
    await client.connect();           // ⚡ здесь сервер зависает, если URL неверный
    db = client.db(dbName);
    console.log("Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);                  // завершить сервер, если нет соединения
  }
}

module.exports = connectDB;
