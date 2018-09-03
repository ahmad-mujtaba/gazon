const express = require("express"),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    config = require('./config/config');

const app = express();

const router = require("./app/routes/routes");
// Bootstrap db connection
mongoose.Promise = global.Promise;
var db = mongoose.connect(config.db, {useMongoClient: true}, function(err){
	if (err) {
		console.log(('Could not connect to MongoDB!'));
		console.log((err));
	}
	else {
		console.log('Connected to:', config.db);
	}
});

try {
    
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
    })); 
    app.use("/", router);
    app.listen(config.PORT);
} catch(e) {
    console.error(e);
}