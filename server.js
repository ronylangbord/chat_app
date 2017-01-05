var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = 8080;
var users = [];

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function (socket) {
    console.log('new connection made');

    //Join private room
    socket.on('join-private', function(data){
        socket.join('private');
        console.log(data.nickname + ' joined private');
    })
    
    
    socket.on('private-chat', function(data){
        socket.broadcast.to('private').emit('show-message', data);
    })
    
    
    //show all users when first logged in 
    socket.on('get-users', function(){
        socket.emit('all-users', users)
    })
    
    
    //when new sockets join
    socket.on('join', function (data) {
        console.log(data); //nickname
        console.log(users);
        socket.nickname = data.nickname;
        users[socket.nickname] = socket;
        var usrObj = {
            nickname: data.nickname,
            socketid: socket.id
        }
        users.push(usrObj);
        //boradcast to all connected users
        io.emit('all-users', users);
    })
    
    //boradcast the message
    socket.on('send-message', function(data){
        //socket.broadcast.emit('message-received', data);
        io.emit('message-received', data);
    })
    
    //send like to a specific user
    socket.on('send-like', function(data){
        console.log(data);
        socket.broadcast.to(data.like).emit('user-liked', data);
    });
    
    //disconnect from socket
    socket.on('disconnect', function(){
        users = users.filter(function(item){
            return item.nickname !== socket.nickname;
        });
        io.emit('all-users', users);
    })
});

    
server.listen(port, function () {
    console.log("Listening on port " + port);
});