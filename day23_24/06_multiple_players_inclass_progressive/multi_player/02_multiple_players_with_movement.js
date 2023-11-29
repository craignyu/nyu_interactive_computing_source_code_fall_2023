// define the port that this project should listen on
const port = 60002;

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

// set up the uniqid library so we can create unique identifiers for our players
const uniqid = require('uniqid');

// read the HTML file for this demo into memory from the 'public' directory
const fs = require('fs');
const htmlFile = fs.readFileSync('./public/02_multiple_players_with_movement.html', 'utf-8');

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

// keep track of all previous players
let allPlayers = {};

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // assign this player a unique ID so we can identify them
    let myId = uniqid();

    // tell this player about any other players in the game
    socket.emit('all_previous_players', allPlayers);

    // listen for new player messages
    socket.on('new_player', function(msg) {

        if (myId) {

            // store the message in our allPlayers array
            allPlayers[myId] = {
                x: msg.x,
                y: msg.y,
                color: msg.color,
                id: myId
            }

            // send this out to all other clients
            socket.broadcast.emit('new_player', allPlayers[myId]);

        }

    });

    // listen for player movement messages
    socket.on('player_moved', function(msg) {

        console.log(myId, allPlayers[myId]);
        if (myId && allPlayers[myId] && msg.x && msg.y) {

            // update this player's position
            allPlayers[myId].x = msg.x;
            allPlayers[myId].y = msg.y;

            // send this out to all other clients
            socket.broadcast.emit('player_moved', allPlayers[myId]);

        }

    });

});