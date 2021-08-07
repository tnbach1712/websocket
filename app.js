// var app = require('http').createServer(handler)

var app = require('express')();
var fs = require('fs');
// var cors = require('cors')

// app.use(cors());
// app.options('*', cors());


// app.use(function(req, res, next){
//   res.header("Access-Control-Allow-Origin",  "*");
//   res.header("Access-Control-Allow-Headers", "*");
//   next();
// });


// var server = require('http').Server(app);
var server = require('https').createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: 'nguyenbach'
}, app)

var io = require('socket.io').listen(server);
const redis = require('socket.io-redis');
const config = require('./config.json');

io.adapter(redis({ host: 'localhost', port: 6379 }));

app.set('view engine', 'ejs');

var webhookRoutes = require('./routes/webhook.js');
webhookRoutes(app);

server.listen(config.webSocketPort);

io.set('transports', ['websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling',
    'polling']);



io.on('connection', function (socket) {
  socket.emit('connected');
  
});

app.use(function(req, res, next){
   res.header("Access-Control-Allow-Origin",  "*");
   res.header("Access-Control-Allow-Headers", "*");
   next();
});

var chat = io
  .of('/chat')
  .on('connection', function (socket) {

    console.log('connection')
    
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
  .of('/notify')
  .on('connection', function (socket) {
    // socket.emit('item', { news: 'item' });
    socket.on("aNotify", function (data) {
      chat.emit('aNotify', data)
    })

    socket.on("sendNotify", function (data) {
      chat.emit('sendNotify', data)
    })

    socket.on("joinConversation", function(data){
      console.log('connection: ' + data.conversationId)
      socket.join(data.conversationId)
    })
  });