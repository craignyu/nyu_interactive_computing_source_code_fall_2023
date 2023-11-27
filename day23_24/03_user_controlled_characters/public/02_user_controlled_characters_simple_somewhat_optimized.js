// our socket connection variable - this is what allows us to send and receive
// messages from the server
let socket;

// reference to our canvas element
let canvas;

// have we entered the world yet?
let worldEntered = false;

// x & y position for our avatar
let x, y;

// color and name for our avatar
let currentColor, username;

// speed for our avatar
const SPEED = 3;

// array to hold onto all the other players
const otherPlayers = {};

// define the set of keys that we care about for navigation
const navigationKeys = {
    'ArrowUp':true,
    'ArrowDown':true,
    'ArrowLeft':true,
    'ArrowRight':true
};

// current navigation instructions being used by this player
const currentNavigation = {
    'ArrowUp':false,
    'ArrowDown':false,
    'ArrowLeft':false,
    'ArrowRight':false
};

function setup() {
    pixelDensity(1);
    canvas = createCanvas(800, 500);
    background(128);

    // initially hide our canvas
    canvas.hide();

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // listen for info about any players who have already joined the world
    socket.on('current_players', function(msg) {
        console.log("CURRENT PLAYERS");
        console.log(msg);
        for (let id in msg) {
            otherPlayers[ id ] = msg[id];
        }
    });

    // listen for new players entering the world
    socket.on('new_player', function(msg) {

        console.log("A new player has entered the world!");
        console.log(msg);

        // add the player to our global object
        otherPlayers[ msg.id ] = msg;
    });

    // listen for players moving
    socket.on('player_move', function(msg) {
        if (otherPlayers[ msg.id ]) {
            otherPlayers[ msg.id ].x = msg.x;
            otherPlayers[ msg.id ].y = msg.y;
            otherPlayers[ msg.id ].keysPressed = msg.keysPressed; 
        }
    });

    // listen for players leaving the world
    socket.on('player_leave', function(msg) {
        if (otherPlayers[ msg.id ]) {
            delete otherPlayers[ msg.id ];
        }
    });


    // note that we should give the server an update to our position on a somewhat regular basis
    setInterval(function() {
        if (worldEntered) {
            // tell the server where we are and what keys we are pressing
            socket.emit('player_move', {
                x: x,
                y: y,
                keysPressed: currentNavigation
            });      
        }
    }, 200);

}

// this function gets called when the user clicks the HTML button
// when it is run we will contact the server and register a new player
function enterWorld() {
    // get the avatar name and color
    username = document.querySelector('#username').value;
    currentColor = document.querySelector('#color_picker').value;

    // pick a random starting location
    x = random(width);
    y = random(height);

    // alert the server that we have a new player
    socket.emit('new_player', {
        x: x,
        y: y,
        n: username,
        c: currentColor,
        keysPressed: currentNavigation
    });

    // show the canvas
    canvas.show();

    // hide the controls div
    document.querySelector('#controls').style.display = 'none';

    // indicate that we have entered the world
    worldEntered = true;
}

function draw() {
    background(128);

    // draw our player (if we have entered the world)
    if (worldEntered) {
        fill(currentColor);
        ellipse(x, y, 20, 20);
        fill(0);
        textAlign(CENTER);
        text(username, x, y + 20);

        // draw all other players
        for (let id in otherPlayers) {
            // first we have to predict where the player is, if they are actively
            // pressing a key on their own computer
            if (otherPlayers[ id ].keysPressed) {
                if (otherPlayers[ id ].keysPressed['ArrowLeft']) {
                    otherPlayers[ id ].x -= SPEED;
                }
                if (otherPlayers[ id ].keysPressed['ArrowRight']) {
                    otherPlayers[ id ].x += SPEED;
                }
                if (otherPlayers[ id ].keysPressed['ArrowUp']) {
                    otherPlayers[ id ].y -= SPEED;
                }
                if (otherPlayers[ id ].keysPressed['ArrowDown']) {
                    otherPlayers[ id ].y += SPEED;
                }    

                otherPlayers[ id ].x = constrain(otherPlayers[ id ].x, 0, width);
                otherPlayers[ id ].y = constrain(otherPlayers[ id ].y, 0, height);
            }
    
            fill(otherPlayers[id].c);
            ellipse(otherPlayers[id].x, otherPlayers[id].y, 20, 20);
            fill(0);
            textAlign(CENTER);
            text(otherPlayers[id].n, otherPlayers[id].x, otherPlayers[id].y + 20);
        }

        // move our player, if necessary
        if (currentNavigation['ArrowLeft']) {
            x -= SPEED;
        }
        if (currentNavigation['ArrowRight']) {
            x += SPEED;
        }
        if (currentNavigation['ArrowUp']) {
            y -= SPEED;
        }
        if (currentNavigation['ArrowDown']) {
            y += SPEED;
        }
        x = constrain(x, 0, width);
        y = constrain(y, 0, height);
    }
}

function keyPressed() {
    // if the key that is being pressed is one that we don't care about
    // then we should ignore it and do nothing
    if (!navigationKeys[key]) {
        return;
    }

    // update our current navigation object to register this key as being pressed
    currentNavigation[key] = true;

    // tell the server where we are and what keys we are pressing
    socket.emit('player_move', {
        x: x,
        y: y,
        keysPressed: currentNavigation
    });    
}

function keyReleased() {
    // if the key that is being pressed is one that we don't care about
    // then we should ignore it and do nothing
    if (!navigationKeys[key]) {
        return;
    }

    // update our current navigation object to register this key as being released
    currentNavigation[key] = false;

    // tell the server where we are and what keys we are pressing
    socket.emit('player_move', {
        x: x,
        y: y,
        keysPressed: currentNavigation
    });      
}