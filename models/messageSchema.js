var mongoose = require('mongoose');
var schema = mongoose.Schema;

var messageSchema = new schema({
    username:String,
    date:String,
    room:String,
    message:String

});

module.exports = messageSchema;
