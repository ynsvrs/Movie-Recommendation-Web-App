const connectDB = require("./db");
const { ObjectId } = require("mongodb");


async function getAllMovies() {
  const db = await connectDB();
  return db.collection("movies").find({}).toArray();
}

async function getMovieById(id) {
  const db = await connectDB();
  return db.collection("movies").findOne({ _id: new ObjectId(id) });
}

async function addMovie(data) {
  const db = await connectDB();
  const result = await db.collection("movies").insertOne(data);
  return result.insertedId;
}

async function updateMovie(id, data) {
  const db = await connectDB();
  const result = await db
    .collection("movies")
    .updateOne({ _id: new ObjectId(id) }, { $set: data });
  return result.modifiedCount;
}

async function deleteMovie(id) {
  const db = await connectDB();
  const result = await db.collection("movies").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}


async function getAllUsers() {
  const db = await connectDB();
  return db.collection("users").find({}).toArray();
}

async function getUserById(id) {
  const db = await connectDB();
  return db.collection("users").findOne({ _id: new ObjectId(id) });
}

async function addUser(data) {
  const db = await connectDB();
  const result = await db.collection("users").insertOne(data);
  return result.insertedId;
}

async function updateUser(id, data) {
  const db = await connectDB();
  const result = await db
    .collection("users")
    .updateOne({ _id: new ObjectId(id) }, { $set: data });
  return result.modifiedCount;
}

async function deleteUser(id) {
  const db = await connectDB();
  const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}

module.exports = {
  // Movies
  getAllMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
  // Users
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
};
