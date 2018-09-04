const express = require("express"),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    config = require('./config/config');

const app = express();

const router = require("./app/routes/routes");

mongoose.connect(config.db);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to "+config.db);
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
    })); 
    app.use("/", router);
    app.listen(config.PORT);
});

    
