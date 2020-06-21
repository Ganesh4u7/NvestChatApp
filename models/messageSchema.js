var mongoose = require('mongoose');
var schema = mongoose.Schema;

var messageSchema = new schema({
    username:String,
    date:String,
    searchDate:Date,
    room:String,
    text:String

});

module.exports = messageSchema;
