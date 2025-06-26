require("dotenv").config();
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const uri = process.env.MONGODB_URI;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(uri)
    .then(client => {
      console.log("Connected to MongoDB Atlas!");
      _db = client.db(); 
      callback();
    })
    .catch((err) => {
      console.log("Connection failed!", err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;