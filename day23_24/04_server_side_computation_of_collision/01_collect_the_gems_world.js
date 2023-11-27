// define the port that this project should listen on
const port = 60021;

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
const htmlFile = fs.readFileSync('./public/01_collect_the_gems_world.html', 'utf-8');

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

// an object keeping track of all gems in the world - the positions of the gems will
// be managed by the server
const MAX_GEMS = 200;
const allGems = {};

// create an initial set of gems when the server starts
for (let i = 0; i < MAX_GEMS; i++) {
    let gemId = uniqid();
    allGems[gemId] = createGem();
}

function createGem() {
    let gemGraphic = parseInt( Math.random() * 4 );
    let gemX = parseInt( Math.random() * 3200 / 32 )*32;
    let gemY = parseInt( Math.random() * 3200 / 32 )*32;
    return {
        graphic: gemGraphic,
        x: gemX,
        y: gemY
    }
}

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // construct a unique identifier for this player
    let playerId = uniqid();

    // tell this player about all other players and gems that are currently here
    socket.emit('current_players_and_gems', {
        players: allPlayers,
        gems: allGems,
        playerId: playerId
    });

    // listen for specific messages from clients

    // new player has joined
    socket.on('new_player', function(msg) {

        // validate incoming message
        if (! (playerId && msg.x && msg.y && msg.c && msg.n && msg.keysPressed) ) {
            return;
        }

        console.log("a new player has entered the world:", msg);

        // store this player info in our object
        allPlayers[playerId] = {
            x: msg.x,
            y: msg.y,
            c: msg.c,
            n: msg.n,
            keysPressed: msg.keysPressed,
            id: playerId,
            gemsCollected: 0
        };

        // alert all clients that this player has entered the world
        io.emit('new_player', allPlayers[playerId]);
    });

    // player has moved
    socket.on('player_move', function(msg) {
        // validate incoming message
        if (! (playerId && allPlayers[playerId] && msg.x && msg.y && msg.keysPressed) ) {
            return;
        }

        // update our position
        allPlayers[playerId].x = msg.x;
        allPlayers[playerId].y = msg.y;

        // alert all other clients that this player has moved
        socket.broadcast.emit('player_move', {
            id: playerId,
            x: msg.x,
            y: msg.y,
            keysPressed: msg.keysPressed
        });
    });

    // player has left
    socket.on("disconnect", function(reason) {
        // validate incoming message
        if (! (playerId && allPlayers[playerId]) ) {
            return;
        }

        // delete this player
        delete allPlayers[playerId];

        // alert all other players that this player has disconnected
        socket.broadcast.emit('player_leave', {
            id: playerId
        });
    });

    // player is attempting to collect a gem
    socket.on("collect_gem", function(msg) {
        // validate incoming message
        if (! (playerId && allPlayers[playerId] && msg.id) ) {
            return;
        }

        // is this gem still active?
        if (allGems[ msg.id ]) {
            // give this user a point and remove the gem!
            allPlayers[ playerId ].gemsCollected += 1;
            delete allGems[ msg.id ];

            // create a new gem in its place
            let gemId = uniqid();
            allGems[gemId] = createGem();

            // emit a message to all players letting them know to remove this gem from play
            io.emit('gem_collected', {
                gemId: msg.id,
                playerId: playerId,
                gems: allGems
            });
        }

    })

});