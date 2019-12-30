// var app = require('http').createServer(handler)

var app = require('express')();
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);
const redis = require('socket.io-redis');
const config = require('./config.json');

io.adapter(redis({ host: 'localhost', port: 6379 }));

app.set('view engine', 'ejs');

var webhookRoutes = require('./routes/webhook.js');
webhookRoutes(app);

server.listen(config.webSocketPort);
console.log(config)

io.on('connection', function (socket) {
  socket.emit('connected');
  
});

var chat = io
  .of('/chat')
  .on('connection', function (socket) {
    console.log(chat)
    socket.emit('a message', {
      that: 'only'
      , '/chat': 'will get'
    });
    chat.emit('a message', {
      everyone: 'in'
      , '/chat': 'will get'
    });

    socket.on("aMessage", function (data) {
      chat.emit('aMessage', data)
    })

    socket.on("sendMessage", function (data) {
      chat.emit('sendMessage', data)
    })

    socket.on("joinConversation", function(data){
      console.log('connection: ' + data.conversationId)
      socket.join(data.conversationId)
    })

    socket.on("leaveConversation", function(data){
      socket.leave(data.conversationId)
    })

    socket.on('sendMessageToConversation', function (conversation, message){
      var conversationId = conversation.conversationId
      socket.to(conversationId).emit('aMessage', message)
    })

  })

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
  });