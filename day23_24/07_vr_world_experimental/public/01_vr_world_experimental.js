// variable to hold a reference to our A-Frame world
let world;

// our socket connection variable - this is what allows us to send and receive
// messages from the server
let socket;

// keep track of our color (we won't see this, but other players will)
let r,g,b;

// keep track our our most recent position
let mostRecentPosition;

// an object to keep track of all previous players
let allPlayers = {};

// buffer for drawing
let buffer;

// drawing flag
let drawingFlag = false;

function setup() {
	// no canvas needed
    pixelDensity(1);
	let canvas = createCanvas(256,256);
    canvas.style('position', 'fixed');
    canvas.style('bottom', '0px');
    canvas.style('left', '0px');
    buffer = createGraphics(256, 256);

	// construct the A-Frame world
	// this function requires a reference to the ID of the 'a-scene' tag in our HTML document
	world = new World('VRScene');

    // create a base plane (floor)
    world.add( new Plane({
        width: 100,
        height: 100,
        rotationX: -90,
        red: 128,
        green: 128,
        blue: 128,
        opacity: 0.5
    }));

    // create a sky (to provide a reference point)
    world.add( new Sky({
        asset: 'theSky'
    }));

    // create a color for ourselves
    r = random(255);
    g = random(255);
    b = random(255);

    // get the user's current position
    mostRecentPosition = world.getUserPosition();

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // tell all other players that we have joined the game
    socket.emit('new_player', {
        x: mostRecentPosition.x,
        z: mostRecentPosition.z,
        r: r,
        g: g,
        b: b
    });

    // listen for any new players that may have joined
    socket.on('new_player', function(message) {
        console.log("A new player has joined!");
        //console.log(message);

        // store the newly joined player in our object

        // create a buffer for this player
        allPlayers[message.id] = {                
                                    buffer: createGraphics(256, 256)
                                 };

        // set it up as a dynamic texture
        allPlayers[message.id].buffer.background(255);
        let texture = world.createDynamicTextureFromCreateGraphics( allPlayers[message.id].buffer );

        // create an entity for our player
        allPlayers[message.id].entity = new Box({
                                                    x: message.x,
                                                    z: message.z,
                                                    y: 1,
                                                    width: 1,
                                                    height: 1,
                                                    depth: 1,
                                                    asset: texture,
                                                    dynamicTexture: true,
                                                    dynamicTextureWidth: 256,
                                                    dynamicTextureHeight: 256
                                                });

        // add the entity to our world
        world.add(allPlayers[message.id].entity);
    });
    
    // listen for all previous players
    socket.on('all_previous_players', function(message) {
        console.log("Got all previous players!");
        //console.log(message);

        // store these players
        for (let id in message) {

            // create a buffer for this player
            allPlayers[id] = {                
                buffer: createGraphics(256, 256)            
            };

            // set it up as a dynamic texture
            allPlayers[id].buffer.background(255);
            let texture = world.createDynamicTextureFromCreateGraphics( allPlayers[id].buffer );

            // create an entity for our player
            allPlayers[id].entity = new Box({
                                        x: message.x,
                                        z: message.z,
                                        y: 1,
                                        width: 1,
                                        height: 1,
                                        depth: 1,
                                        asset: texture,
                                        dynamicTexture: true,
                                        dynamicTextureWidth: 256,
                                        dynamicTextureHeight: 256
                                    });

            // add the entity to our world
            world.add(allPlayers[id].entity);
        }
        //console.log(allPlayers);
    });

    // listen for player movement events
    socket.on('player_moved', function(message) {
        if (message.id && allPlayers[message.id]) {
            console.log("A player has moved!");
            //console.log(message);
    
            // update this player's location
            allPlayers[message.id].entity.setX(message.x);
            allPlayers[message.id].entity.setZ(message.z);    
        }
    });

    // listen for player leave events
    socket.on('player_leave', function(message) {
        if (message.id && allPlayers[message.id]) {
            console.log("A player has left!");
            //console.log(message);

            // delete this player
            world.remove(allPlayers[message.id].entity);
            delete allPlayers[message.id];
        }
    });

    socket.on('new_drawing', function(message) {
        if (message.id && allPlayers[message.id] && message.image) {
            //console.log(message);
            loadImage(message.image, function(img) {
                allPlayers[message.id].buffer.image(img, 0, 0);
            });
        }
    });


    setInterval(function() {
        // get our current position
        let currentPosition = world.getUserPosition();

        // have we moved?  if so, we need to tell the other clients abou this
        if (!(currentPosition.x == mostRecentPosition.x && currentPosition.z == mostRecentPosition.z)) {
            socket.emit('player_moved', {
                x: currentPosition.x,
                z: currentPosition.z
            });
            mostRecentPosition = currentPosition;
        }
    }, 200)

}

function draw() {

    background(255);

    if (mouseIsPressed && mouseX >= 0 && mouseY <= width) {
        drawingFlag = true;
        buffer.fill(0);
        buffer.ellipse(mouseX, mouseY, 20, 20);
    }

    image(buffer, 0, 0);

    fill(0);
    text("'c' to clear", 20, 20);
}

function keyPressed() {

    if (key == 'c' || key == 'C') {
        buffer.background(255);

        // send our current drawing to the server
        let pngRawImageStringData = buffer.elt.toDataURL();        
        socket.emit('new_drawing', {
            data: pngRawImageStringData
        });    
    }
}

function mouseReleased() {
    if (drawingFlag) {
        drawingFlag = false;

        // send our current drawing to the server
        let pngRawImageStringData = buffer.elt.toDataURL();
        socket.emit('new_drawing', {
            data: pngRawImageStringData
        });    
    }
}

