const express = require("express");

const trainRoutes = express.Router();
 
// connect to database
const dbo = require("../db/conn");
 
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
 
// get a single train by its train number
trainRoutes.route("/train/:s").get(function (req, res) {
 let db_connect = dbo.getDb();
 let myquery = { service: req.params.s };
 db_connect
   .collection("delays")
   .findOne(myquery, function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
module.exports = trainRoutes;