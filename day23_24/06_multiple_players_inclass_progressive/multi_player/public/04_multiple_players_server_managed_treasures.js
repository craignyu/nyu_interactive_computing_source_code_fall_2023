// position of the user controlled character
let x, y;

// color selected by the user
let currentColor;

// socket connection with the server
let socket;

// an object to keep track of all previous players
let allPlayers = {};

// an array to keep track of all treasures
let allTreasures = [];

function setup() {
    createCanvas(800, 600);
    background(128);
    noStroke();

    // grab the color from the HTML form
    currentColor = document.getElementById('color_picker').value;

    // pick a random starting spot
    x = random(width);
    y = random(height);    

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // tell all other players that we have joined the game
    socket.emit('new_player', {
        x: x,
        y: y,
        color: currentColor
    });

    // listen for any new players that may have joined
    socket.on('new_player', function(message) {
        console.log("A new player has joined!");
        console.log(message);

        // store the newly joined player in our object
        allPlayers[message.id] = message;
    });

    // listen for all previous players
    socket.on('all_previous_players', function(message) {
        console.log("Got all previous players!");
        console.log(message);

        // store these players
        for (let id in message) {
            allPlayers[id] = message[id];
        }
        console.log(allPlayers);
    });

    // listen for player movement events
    socket.on('player_moved', function(message) {
        if (message.id && allPlayers[message.id]) {
            console.log("A player has moved!");
            console.log(message);

            // update this player's location
            allPlayers[message.id].x = message.x;
            allPlayers[message.id].y = message.y;    
        }
    });

    // listen for color change events
    socket.on('color_change', function(message) {
        if (message.id && message.color && allPlayers[message.id]) {
            console.log("A player has changed their color!");
            console.log(message);

            // update this player's color
            allPlayers[message.id].color = message.color;    
        }
    })

    // listen for player leave events
    socket.on('player_leave', function(message) {
        if (message.id && allPlayers[message.id]) {
            console.log("A player has left!");
            console.log(message);

            // delete this player
            delete allPlayers[message.id];    
        }
    })

    // listen for all treasure locations
    socket.on('all_treasures', function(message) {
        console.log("Got all treasure locations!");
        console.log(message);

        allTreasures = message;
    })
}

function draw() {
    background(128);

    // draw all treasures
    for (let id in allTreasures) {
        fill(255,255,0);
        ellipse(allTreasures[id].x, allTreasures[id].y, 5, 5);
    }

    // draw all other players that we know about
    for (let id in allPlayers) {
        fill(allPlayers[id].color);
        ellipse(allPlayers[id].x, allPlayers[id].y, 20, 20);
    }
    
    // draw our character
    fill(currentColor);
    ellipse(x, y, 20, 20);

    // move our character
    let moved = false;
    if (keyIsDown(LEFT_ARROW)) {
        x -= 3;
        moved = true;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        x += 3;
        moved = true;
    }
    if (keyIsDown(UP_ARROW)) {
        y -= 3;
        moved = true;
    }
    if (keyIsDown(DOWN_ARROW)) {
        y += 3;
        moved = true;
    }

    // constrain our position to the visible canvas
    x = constrain(x, 0, width);
    y = constrain(y, 0, height);

    // have we moved?  if so, we need to tell the other clients abou this
    if (moved) {
        socket.emit('player_moved', {
            x: x,
            y: y
        });
    }
}

function changeColor() {
    currentColor = document.getElementById('color_picker').value;

    // alert other players about our color change
    socket.emit('color_change', {
        color: currentColor
    });
}