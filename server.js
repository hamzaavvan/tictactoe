var express = require('express');
var app = express();
var http = require('http').createServer(app);
var session = require('express-session');
var io = require('socket.io')(http);
var Board = require('./board');
var Player = require('./player');

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname+"/GUI");

app.use(express.static(__dirname+'/GUI'));
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({  
  extended: true  
}));  

app.use(session({
  secret: '$#0x--♠☻☺./\\',
  saveUninitialized: true,
  resave: false
}));

var board = new Board;
Player = new Player;


app.get('/', function(req, res){
  let user = req.session.user;
  
  if (!user)
    return res.sendFile(__dirname +'/GUI/main.html');

  let player = Player.get(user.id);
  if (!player || board.matchEnded(player.matchId) || board.isMatchDraw(player.matchId)) {
    delete req.session.user;

    if (player) // if match ended and player existed
      Player.delete(player.id);

    return res.sendFile(__dirname +'/GUI/main.html');
  }
  
  let name = user.name;
  let searching_htm = `Waiting`;
  let opponent_sym = "";
  
  if(player.symbol) opponent_sym= player.symbol=='X'?'O':'X';
  let d = {name, opposition: searching_htm, uid: player.id, match_moves: null, symbol: player.symbol, opponent_sym, lock: null, "avatar_id":player.avatar_id, "opp_avatar_id":null};

  if (player.started) {
    let opposition_user = Player.opposition(player.id);

    d.opposition = opposition_user.name;
    d.lock = player.lock;
    d.opp_avatar_id = opposition_user.avatar_id;
  }

  let match_moves = board.getMatchMoves(player.matchId);
  d.match_moves = match_moves;

  console.log(match_moves)
  res.render('game.html', d);
});

app.post('/start', function(req, res){
  if (req.session.user)
    return res.redirect('/');

  let new_player = Player.new({name: req.body.name, opposition: '', "avatar_id": Math.floor(Math.random() * 15)+1, started: false, symbol: '', lock: -1, matchId: null});
  let user = {id : new_player.id, name: new_player.name};
  req.session.user = user;

  io.emit('started', user.name);
  console.log(`User ${user.name} started the game`);


  if (Player.count() >0) {
    for (let player of Player.all()) {
      if (player.started == false && player.id != new_player.id) {
        console.log(`challenger found ${player.name}`)
       
        new_player.started = player.started = true;
        new_player.symbol = 'O';
        new_player.opposition = player.id;
        new_player.lock = 1;
        player.symbol = 'X';
        player.opposition = new_player.id;
        player.lock = 0;
        
        let match_id = board.matchCount();
        new_player.matchId = player.matchId = match_id;
        board.newMatch({match_id, moves: new Array(9), ended:false, draw:false});

        Player.update(player.id, player);
        Player.update(new_player.id, new_player);

        break;
      }
    }
  }


  if (new_player.started == true) {
    let cur_player = Player.get(req.session.user.id);
    let opponent = Player.get(cur_player.opposition);

    let d = {challenger_name: user.name, symbol: opponent.symbol, opponent_sym: cur_player.symbol, avatar_id:cur_player.avatar_id};

    io.emit('found_challenger', JSON.stringify(d));
  }

  res.redirect('/');
});

app.put('/move', (req, res) => {
  let user = req.session.user;
  let player = Player.get(user.id);

  if (board.matchEnded(player.matchId) || player.lock >0 || !Player.exist(player.id) || player.started == false) {
    res.writeHead(401);
    return res.end();
  }

  let cell = req.body.box;
  let symbol = player.symbol;

  if (!board.setMatchMove(player.matchId, cell, symbol)) {
    res.writeHead(401);
    return res.end();
  }

  io.emit('user_move', JSON.stringify({id: player.id, cell, symbol}));
  console.log(`User ${player.name} made a move at ${cell}`);

  player.lock = 1;
  Player.opposition(player.id).lock = 0;

  let winner = board.checkForWinner(player, Player);
  if (winner)
    io.emit('match_ended', JSON.stringify(winner));

    let is_draw = board.matchDraw(player.matchId);
    if (is_draw)
      io.emit('match_draw', JSON.stringify({msg: "Match draw!"}));

  res.writeHead(204);
  res.end();
});

app.get('/check', (req, res) => {
  let user = req.session.user;
  let player = Player.get(user.id);
 
  if (!Player.exist(user.id) || (player&&player.started == false)) {
    res.writeHead(400);
    return res.end();
  }

  res.send(player.lock==0);
  res.end();
});


app.get('/end', (req, res) => {
  let user = req.session.user;
 
  if (!user || !Player.exist(user.id)) {
    res.writeHead(400);
    return res.end();
  }

  let player = Player.get(user.id);

  if (board.hasMatch(player.matchId))
    board.endMatch(player.matchId);

  Player.delete(player.id);
  
  let winner = Player.get(player.opposition);
  io.emit('match_left', JSON.stringify(winner));

  return res.redirect('/');
});

io.on('connection', function(socket){
  console.log('connected');
});


app.post('/msg', function(req, res){
  if (!req.session.user)
    return res.redirect('/');

  let user = req.session.user;
  let msg = req.body.msg;

  let player = Player.get(user.id);
  if (player || !board.matchEnded(player.matchId)) {
    let opposition_user = Player.opposition(player.id);

    if (!opposition_user) {
      res.writeHead(400);
      return res.end()
    }

    let d = {msg: msg, user_id: player.opposition};

    io.emit("msg_rec", JSON.stringify(d));

    res.writeHead(204);
    return res.end();
  }
});

http.listen(PORT, function(){
  console.log(`listening on http://localhost:${PORT}`);
});
