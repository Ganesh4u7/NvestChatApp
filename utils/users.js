var mongoose = require('mongoose');
var usersSchema = require('../models/userSchema');
var usersData = mongoose.model('userData',usersSchema);

var users =[];


function userEntered(id,username,rooms) {
var user = {id,username,rooms};
users.push(user);
//   console.log(users[0].rooms);
// console.log('hi');
}

function userJoin(id,username,room,index){
   users.find(user => {
     if(user.username === username){
       user.rooms[index].status = 1;
       //console.log(user);

     }
   });

 return  users.find(user => user.username === username);


}

function getCurrentUser(id) {
 return users.find(user => user.id === id);
}

function userLeave(id){
    var index = users.findIndex(user => user.id === id);
    console.log(index);

    if(index !== -1){
        return users.splice(index,1)[0];
    }
}
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    userEntered,
    validateEmail
};
