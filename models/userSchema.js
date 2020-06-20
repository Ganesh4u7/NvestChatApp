var mongoose = require('mongoose');
var schema = mongoose.Schema;

var usersSchema = new schema({
  username:{
    type:String,
    unique:true,
    required:true
  },
  id:String,
  rooms:[{
   room:String,
    status:Number
  }]
});
module.exports = usersSchema;
