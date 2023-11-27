// define the port that this project should listen on
const port = 60011;

// set up express
const express = require('express');
const app = express();

// set up the 'public' folder to serve static content to the user
app.use( express.static('public') );

// set up socket io for bidirectional communication with the client
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// bring in the uniqid library to create unique identifiers for our players
const uniqid = require('uniqid');

// read the HTML file for this demo into memory from the 'public' directory
const fs = require('fs');
const htmlFile = fs.readFileSync('./public/01_user_controlled_characters_simple.html', 'utf-8');

// tell the server to send out the HTML file for this demo when it gets contacted
app.get("/", function(request, response) {
    // tell the user they should expect HTML
    response.type('html');

    // send the HTML file to the browser
    response.write(htmlFile);

    // tell the browser we are done!
    response.end();
});

// start up the server (go to your browser and visit localhost:port)
server.listen(port, () => {
    console.log(`listening on :${port}`);
});




// your custom code for faciltating communication with clients can be written below

// an object keeping track of all players
const allPlayers = {};

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // construct a unique identifier for this player
    let playerId = uniqid();

    // tell this player about all other players that are currently here
    socket.emit('current_players', allPlayers);

    // listen for specific messages from clients

    // new player has joined
    socket.on('new_player', function(msg) {
        console.log("a new player has entered the world:", msg);

        // store this player info in our object
        allPlayers[playerId] = {
            x: msg.x,
            y: msg.y,
            c: msg.c,
            n: msg.n,
            id: playerId
        };

        // alert all other clients that this player has entered the world
        socket.broadcast.emit('new_player', allPlayers[playerId]);
    });

    // player has moved
    socket.on('player_move', function(msg) {
        // update our position
        allPlayers[playerId].x = msg.x;
        allPlayers[playerId].y = msg.y;

        // alert all other clients that this player has moved
        socket.broadcast.emit('player_move', {
            id: playerId,
            x: msg.x,
            y: msg.y
        });
    });

    // player has left
    socket.on("disconnect", function(reason) {
        // delete this player
        delete allPlayers[playerId];

        // alert all other players that this player has disconnected
        socket.broadcast.emit('player_leave', {
            id: playerId
        });
    });

});