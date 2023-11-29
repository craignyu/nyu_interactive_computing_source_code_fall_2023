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
const htmlFile = fs.readFileSync('./public/01_vr_world_experimental.html', 'utf-8');

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

        if (!allPlayers[myId]) {
            console.log("registering new player", msg);

            // store the message in our allPlayers array
            allPlayers[myId] = {
                x: msg.x,
                z: msg.z,
                r: msg.r,
                g: msg.g,
                b: msg.b,
                id: myId
            }
    
            // send this out to all other clients
            socket.broadcast.emit('new_player', allPlayers[myId]);    
        }

    });

    // listen for player movement messages
    socket.on('player_moved', function(msg) {

        if (allPlayers[myId]) {
            // update this player's position
            allPlayers[myId].x = msg.x;
            allPlayers[myId].z = msg.z;

            // send this out to all other clients
            socket.broadcast.emit('player_moved', allPlayers[myId]);
        }


    });

    // player has left
    socket.on("disconnect", function(reason) {
        if (allPlayers[myId]) {
            // delete this player
            delete allPlayers[myId];

            // alert all other players that this player has disconnected
            socket.broadcast.emit('player_leave', {
                id: myId
            });
        }
    });

    // listen for specific messages from clients
    socket.on('new_drawing', function(msg) {
        if (allPlayers[myId]) {
            console.log("a new drawing was added by one of our clients:");

            // send this message to ALL other clients
            socket.broadcast.emit('new_drawing', {
                image: msg.data,
                id: myId
            });
        }

    });


});