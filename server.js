var path = require('path');
var normalizePort = require('normalize-port');
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var socketio = require('socket.io');
var moment =require('moment');


var usersSchema = require('./models/userSchema');
var usersData = mongoose.model('userData',usersSchema);
var messageSchema = require('./models/messageSchema');
var messageData = mongoose.model('messagesData',messageSchema);

var formatMessage = require('./utils/messages');
var {userJoin,getCurrentUser,userLeave,getRoomUsers,userEntered,validateEmail} = require('./utils/users');


const uri = "mongodb://roger:thebest1@ds063769.mlab.com:63769/nvest-chatapp1";
mongoose.connect(uri,{ useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Connection succeeded.");
});

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var rooms= ['Cse','Mech','IT'];

var botName = 'bot';
var timer = [null,null,null]

app.use(express.static(path.join(__dirname,'dist/chatApp')));
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname,"./dist/chatApp/index.html"));
});

io.on('connection',socket=>{
    console.log('new connection made');

    socket.on('join',({username})=>{
      let check = validateEmail(username);
      if(check == true) {
        usersData.find({username: username}, function (err, data) {
          console.log('user found');
          if (err) {
            console.log(err)
          } else if (data.length == 0) {
            var userDetails = new usersData({
              username: username, id: socket.id, rooms: [{room: rooms[0], status: 0},
                {room: rooms[1], status: 0}, {room: rooms[2], status: 0}]
            });
            userDetails.save(function (err1, data1) {
              if (err1) {
                console.log(err1)
              } else {
                // console.log(data1);
                socket.emit('join', userDetails);
                userEntered(data1.id, data1.username, data1.rooms);
              }
            });

          } else if (data.length > 0) {
            data[0].id = socket.id;
            console.log(socket.id);
            data[0].save(function (err1, data1) {
              if (err1) {
                console.log(err1)
              } else {
                // console.log(data1)
                for (let i = 0; i < 3; i++) {
                  if (data1.rooms[i].status == 1) {
                    socket.join(data1.rooms[i].room);
                    console.log(timer[i]);
                    socket.emit('showTimer',{time: timer[i],index:i});
                    socket.emit('message',formatMessage(botName,'Welcome to chat room',i));
                    let index = i;
                    socket.broadcast.to(data1.rooms[i].room).emit('message',
                      formatMessage(botName, `${data1.username} is online`, index));
                  }
                }
              }
            });
            socket.emit('join', data[0]);
            userEntered(data[0].id, data[0].username, data[0].rooms);
          }
        });
      }
    })

    socket.on('joinRoom',({username,room,index})=>{
       console.log(username,room,index);
      var user = userJoin(socket.id,username,room,index);
      usersData.find({username:username},function (err,data) {
        console.log('user found');
        if(err){console.log(err)}
        else{console.log(data)
          data[0].rooms[index].status = 1;
          data[0].save(function (err1,data1) {
            if(err1){console.log(err1)}
            else{
              console.log(data1);
              if(timer[index]==null){
                const myDate = new Date();
                myDate.setHours( myDate.getHours() + 5 );
                 timer[index]=myDate.getTime();

                console.log(timer[index]);
                socket.emit('showTimer',{time: timer[index],index:index});

                setTimeout(function () {
                  let name = rooms[index];
                  rooms[index] = null;
               io.emit('removeAccess',{index:index});
                usersData.updateMany({"rooms.room":name},{$set:{'rooms.$.room':null}},{multi:true},function (err,data) {
                     if(err){console.log(err)}
                      else{console.log(data)}

                  })
                },1000*60*60*5 );
              }else{
                socket.emit('showTimer',{time: timer[index],index:index});
              }
              socket.emit('rooms',data1.rooms);

            }
          });

        }
      });


        console.log('-------');
       // console.log(user);

     if(user){
       socket.join(room);
     }
     //console.log(user);

        socket.emit('message',formatMessage(botName,'Welcome to chat room',index));
      socket.broadcast.to(room).emit('message',
        formatMessage(botName, `${username} is online`, index));


        // socket.broadcast.to(room).emit('message',
        //     formatMessage(botName,`${user.username} has joined`),index);

        // io.to(user.room).emit('roomUsers',{
        //     room:user.room,
        //     users:getRoomUsers(user.room)
        // });
    });



    socket.on('chatMessage',(data)=>{
        // var user = getCurrentUser(socket.id);
        console.log(data.message);
        io.to(data.room).emit('message',formatMessage(data.username,data.message,data.index));

        var messageInfo = new messageData({
          username:data.username,
          date: moment().format('h:mm a'),
          message:data.message,
          room:data.room
        });
        messageInfo.save(function (err,data) {
          if(err){console.log(err)}
          else{
            console.log(data);
          }
        });

    });

    socket.on('typing',(data)=>{
      console.log(data);
     socket.broadcast.to(data.room).emit('typing',{username:data.username,index:data.index,
       message:`${data.username} is Typing...`})
  });

    socket.on('signout',()=>{
      var user = userLeave(socket.id);
      if(user){
        console.log(user.rooms);
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} disconnected`));
        io.to(user.room).emit('roomUsers',{
          room:user.room,
          users:getRoomUsers(user.room)
        });
        for(let i =0;i<3;i++){
          if(user.rooms[i].status == 1){

            socket.broadcast.to(user.rooms[i].room).emit('message',
              formatMessage(botName,`${user.username} went offline`,i));
          }
        }
      }
    });
    socket.on('disconnect',()=>{
      console.log('disconnected');
        var user = userLeave(socket.id);
        if(user){
            console.log(user.rooms);
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} disconnected`));
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
            for(let i =0;i<3;i++){
              if(user.rooms[i].status == 1){

                socket.broadcast.to(user.rooms[i].room).emit('message',
                  formatMessage(botName,`${user.username} went offline`,i));
              }
            }
        }
    });
})


var port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

server.listen(port,function (err,res) {
if(err){console.log(err)}
else{ console.log('server connected to port:'+port)}
});
