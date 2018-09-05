const express = require("express"),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    cron = require("node-cron"),
    config = require('./config/config');

const app = express();

const apiRouter = require("./app/routes/api.routes");
const apiController= require("./app/controllers/api.controller");
const utilRouter = require("./app/routes/util.routes");

mongoose.connect(config.db, { useNewUrlParser: true });
/*
let task = cron.schedule('5 * * * *', function(){
    console.log('starting cron task');
    apiController.logUsage();
}, true);
task.start();*/

setInterval(function(){
    console.log('starting cron task');
    apiController.logUsage();
}, 1000 * 60 * 20);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to "+config.db);
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    })); 
    
    app.use("/", utilRouter);
    app.use("/", apiRouter);
    
    
    app.listen(config.PORT);

    
});

    
