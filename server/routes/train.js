const express = require("express");

const trainRoutes = express.Router();
 
// connect to database
const dbo = require("../db/conn");
 
// convert id string to ObjectID
const ObjectId = require("mongodb").ObjectId;
 
// get all trains
trainRoutes.route("/train").get(function (req, res) {
 let db_connect = dbo.getDb();
 db_connect
   .collection("delays")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// get a single train by ID
trainRoutes.route("/train/:id").get(function (req, res) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect
   .collection("delays")
   .findOne(myquery, function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
module.exports = trainRoutes;