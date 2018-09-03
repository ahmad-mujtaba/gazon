const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    name : String,
    pass : String,
    timestamp: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('User', UserSchema);

