// position of the user controlled character
let x, y;

// color selected by the user
let currentColor;

// socket connection with the server
let socket;

// an object to keep track of all previous players
let allPlayers = {};

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

        // store the newly joined player in our object
        allPlayers[message.id] = message;
    });

}

function draw() {
    background(128);

    // draw all other players that we know about
    for (let id in allPlayers) {
        fill(allPlayers[id].color);
        ellipse(allPlayers[id].x, allPlayers[id].y, 20, 20);
    }
    
    // draw our character
    fill(currentColor);
    ellipse(x, y, 20, 20);

    // move our character
    if (keyIsDown(LEFT_ARROW)) {
        x -= 3;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        x += 3;
    }
    if (keyIsDown(UP_ARROW)) {
        y -= 3;
    }
    if (keyIsDown(DOWN_ARROW)) {
        y += 3;
    }

    // constrain our position to the visible canvas
    x = constrain(x, 0, width);
    y = constrain(y, 0, height);
}

function changeColor() {
    currentColor = document.getElementById('color_picker').value;
}