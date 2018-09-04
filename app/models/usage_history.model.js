const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UsageHistorySchema = new Schema({
    creationTime : {
      type:Date,
      default: Date.now
    },
    result : Object
}, {collection: 'usage_history'});

module.exports = mongoose.model('usage_history', UsageHistorySchema);

