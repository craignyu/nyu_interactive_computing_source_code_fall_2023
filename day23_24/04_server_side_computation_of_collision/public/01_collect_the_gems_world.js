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

// offset for our world
let offsetX, offsetY;

// graphics for our world
let worldMap, worldMapGrassOverlay;
let gemChoices = [];

// an object to keep track of gem positions
let theGems = {};

// how many gems have we collected?
let points = 0;

// reference to our own player id
let myPlayerId;

// load our graphics
function preload() {
    worldMap = loadImage('images/map.png');
    worldMapGrassOverlay = loadImage('images/mapGrassOverlay.png');
    gemChoices.push( loadImage('images/gem_blue.png') );
    gemChoices.push( loadImage('images/gem_green.png') );
    gemChoices.push( loadImage('images/gem_pink.png') );
    gemChoices.push( loadImage('images/gem_yellow.png') );
}

function setup() {
    // set up and move our canvas to the correct DOM element
    pixelDensity(1);
    canvas = createCanvas(800, 500);
    canvas.parent('canvas_container');

    // initially hide our canvas
    canvas.hide();

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // listen for info about any players who have already joined the world
    socket.on('current_players_and_gems', function(msg) {
        console.log("CURRENT PLAYERS & GEMS");
        console.log(msg);

        // store these players in a local object
        for (let id in msg.players) {
            otherPlayers[ id ] = msg.players[id];
        }

        // store these gems in a local object
        for (let id in msg.gems) {
            theGems[ id ] = msg.gems[id];
        }
        
        // store our own player record
        myPlayerId = msg.playerId;
    });

    // listen for new players entering the world
    socket.on('new_player', function(msg) {

        console.log("A new player has entered the world!");
        console.log(msg);

        // add the player to our global object
        otherPlayers[ msg.id ] = msg;

        // update the leaderboard
        updatePointsAndLeaderboard();        
    });

    // listen for players moving
    socket.on('player_move', function(msg) {

        // if we know about this player, update their player record
        if (otherPlayers[ msg.id ]) {
            otherPlayers[ msg.id ].x = msg.x;
            otherPlayers[ msg.id ].y = msg.y;
            otherPlayers[ msg.id ].keysPressed = msg.keysPressed; 
        }
    });

    // listen for players leaving the world
    socket.on('player_leave', function(msg) {

        // if we know about this player, delete their player record
        if (otherPlayers[ msg.id ]) {
            delete otherPlayers[ msg.id ];
        }
    });

    // did we receive a message that a gem has been collected and is out of play?
    socket.on('gem_collected', function(msg) {

        // is this gem still in play?
        if (theGems[ msg.gemId ]) {

            // delete the gem
            delete theGems[ msg.gemId ];

            // make sure this user gets a point (even if it is us!)
            otherPlayers[msg.playerId].gemsCollected += 1;
        }

        // update our gem object
        theGems = msg.gems;

        // update our points and leaderboard
        updatePointsAndLeaderboard();        
    })


    // note that we should give the server an update to our position on a somewhat regular basis
    setInterval(function() {

        // if the game has started (they have provided a player name & color)
        if (worldEntered) {

            // tell the server where we are and what keys we are pressing
            socket.emit('player_move', {
                x: offsetX,
                y: offsetY,
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

    // make sure they provide a name
    if (username.length < 1) {
        return;
    }

    // all players start at the center of the world
    offsetX = int(-worldMap.width/2 + width/2)
    offsetY = int(-worldMap.height/2 + height/2)

    // alert the server that we have a new player
    // note that we haven't dealt with any issues surrounding players having the same name
    socket.emit('new_player', {
        x: offsetX,
        y: offsetY,
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

    // grey background
    background(128);

    // run game logic if we have successfully entered the world
    if (worldEntered) {
        
        // draw the game map -- note that we are using an "offset" system in this demo, which allows
        // the world to be much bigger than the actual canvas.  see the sample code from our discussion
        // on tile based games for a more detailed description of how this logic works
        push();
        translate(offsetX, offsetY);
        image(worldMap, 0, 0);
        image(worldMapGrassOverlay, 0, 0);

        // draw all gems and see if the gem has been collected by this player
        for (let id in theGems) {
            // image the gem
            image( gemChoices[ theGems[id].graphic ], theGems[id].x, theGems[id].y );

            // have we gotten close to a gem?  if so, we need to ask the server if we
            // are the first one to grab it. if so, we can get a point and the gems
            // will be updated for everyone else
            let gemX = theGems[id].x+16-width/2;
            let gemY = theGems[id].y+16-height/2;
            let playerX = abs(offsetX);
            let playerY = abs(offsetY);

            // note that we are doing some annoying (hacky) logic here to deal with gems
            // that exist in a negative offset (extreme left / top of the world)
            if (gemX < 0) {
                playerX = -playerX
            }
            if (gemY < 0) {
                playerY = -playerY;
            }

            // are we close to teh gem?  if so, tell the server that we want to collect it
            // the server will respond with a separate message confirming the collection
            // (see the setup function to see how this works)
            if (dist(gemX, gemY, playerX, playerY) < 16)  {
                socket.emit("collect_gem", {
                    id: id
                });
            }    
        }

        pop();

        // draw all other players
        for (let id in otherPlayers) {

            // don't draw ourselves
            if (id == myPlayerId) {
                continue;
            }

            // first we have to predict where the player is, if they are actively
            // pressing a key on their own computer
            if (otherPlayers[ id ].keysPressed) {
                if (otherPlayers[ id ].keysPressed['ArrowLeft']) {
                    otherPlayers[ id ].x += SPEED;
                }
                if (otherPlayers[ id ].keysPressed['ArrowRight']) {
                    otherPlayers[ id ].x -= SPEED;
                }
                if (otherPlayers[ id ].keysPressed['ArrowUp']) {
                    otherPlayers[ id ].y += SPEED;
                }
                if (otherPlayers[ id ].keysPressed['ArrowDown']) {
                    otherPlayers[ id ].y -= SPEED;
                }    

                // keep our players to the bounds of the visible world
                otherPlayers[ id ].x = constrain(otherPlayers[ id ].x, -worldMap.width+width/2, 0+width/2);
                otherPlayers[ id ].y = constrain(otherPlayers[ id ].y, -worldMap.height+height/2, 0+height/2);
            }

            // draw the other player
            push();
            translate(offsetX - otherPlayers[id].x + 0.5*width, offsetY - otherPlayers[id].y + 0.5*height);
            fill(otherPlayers[id].c);
            ellipse(0, 0, 20, 20);
            fill(0);
            textAlign(CENTER);
            text(otherPlayers[id].n, 0, 20);
            pop();
        }

        // draw our player (always in the center of the screen)
        fill(currentColor);
        ellipse(width/2, height/2, 20, 20);
        fill(0);
        textAlign(CENTER);
        text(username, width/2, height/2+20);

        // move our player, if necessary
        if (currentNavigation['ArrowLeft']) {
            offsetX += SPEED;
        }
        if (currentNavigation['ArrowRight']) {
            offsetX -= SPEED;
        }
        if (currentNavigation['ArrowUp']) {
            offsetY += SPEED;
        }
        if (currentNavigation['ArrowDown']) {
            offsetY -= SPEED;
        }
        offsetX = constrain(offsetX, -worldMap.width+width/2, 0+width/2);
        offsetY = constrain(offsetY, -worldMap.height+height/2, 0+height/2);
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
        x: offsetX,
        y: offsetY,
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
        x: offsetX,
        y: offsetY,
        keysPressed: currentNavigation
    });      
}

// update the global leaderboard & point display
function updatePointsAndLeaderboard() {
    // do we have a player ID yet (have we entered the world) along with a player record from the server?
    if (myPlayerId && otherPlayers[myPlayerId]) {
        // if so, display our score
        document.querySelector('#your_score').innerText = otherPlayers[myPlayerId].gemsCollected;
    }
    else {
        return;
    }

    // show the leaderboard element
    document.querySelector('#leaderboard').style.display = 'block';

    // create a temporary array that contains all of the other players (we are doing this to take
    // advantage of the sort method which will let us find the top ranked players)
    let temp = [];
    for (let id in otherPlayers) {
        temp.push( otherPlayers[id] );
    }

    // sort the players by gems collected
    let sortedPlayers = temp.sort( function(a,b) {
        return -1 * (a.gemsCollected - b.gemsCollected);
    });

    // display the top 5 players
    let top_playersRef = document.querySelector('#top_players');
    top_playersRef.innerHTML = '';
    for (let i = 0; i < sortedPlayers.length; i++) {
        document.querySelector('#top_players').innerHTML += `${i+1}. ${sortedPlayers[i].n} (${sortedPlayers[i].gemsCollected} collected)<br>`;
        if (i >= 4) {
            break;
        }
    }
}