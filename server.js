//server.js
//libraries
var express = require('express');
var bodyParser = require('body-parser');
var reports = require('./routes/reports'); //Own Routes
var quotes = require('./models/quotes');

//init app
var app = express();

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

//Middleware
app.use(bodyParser.json()); //parse request Bodies
app.use(bodyParser.urlencoded());
app.use('/api', reports); //Own routes, we add the middleware
app.use('/api', quotes);
//Start the server
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server listening in the port: ' + port);