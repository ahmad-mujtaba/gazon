const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    user : String,
    pass : String,
    timestamp: {
      type: Date,
      default: Date.now
    }
}, {collection: 'user'});

module.exports = mongoose.model('user', UserSchema);

