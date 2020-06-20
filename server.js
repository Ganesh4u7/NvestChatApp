var path = require('path');
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var socketio = require('socket.io');
var formatMessage = require('./utils/messages');
var {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');


var app = express();
var server = http.createServer(app);
var io = socketio(server);

var botName = 'some name';

app.use(express.static(path.join(__dirname,'public')));

io.on('connection',socket=>{
    console.log('new connection made');

    socket.on('joinRoom',({username,room})=>{
        var user = userJoin(socket.id,username,room);

        console.log(user.room);

        socket.join(user.room);

        socket.emit('message',formatMessage(botName,'Welcome to chat room'));

        socket.broadcast.to(user.room).emit('message',
            formatMessage(botName,`${user.username} has joined`));

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });



    socket.on('chatMessage',(msg)=>{
        var user = getCurrentUser(socket.id);
        console.log(msg);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })
    socket.on('disconnect',()=>{
        var user = userLeave(socket.id);
        if(user){

            io.to(user.room).emit('message',formatMessage(botName,`${user.username} disconnected`));
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        }
    });
})


var port =  process.env.port || 8080;

server.listen(port,function (err,res) {
if(err){console.log(err)}
else{ console.log('server connected to port:'+port)}
});
