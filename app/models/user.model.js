const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    user : String,
    pass : String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    enableHistory: {
      type: Boolean,
      default:true,
    }
}, {collection: 'user'});

module.exports = mongoose.model('user', UserSchema);

