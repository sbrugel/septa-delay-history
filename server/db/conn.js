const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
let _db;
 
module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) { // I don't care this is deprecated I just want the code to work ;(
      // Verify we got a good "db" object
      if (db)
      {
        _db = db.db("delayDB");
        console.log("Successfully connected to MongoDB."); 
      }
      return callback(err);
         });
  },
 
  getDb: function () {
    return _db;
  },
};