// our socket connection variable - this is what allows us to send and receive
// messages from the server
let socket;

// the current color that the user has selected
let currentColor;

function setup() {
    pixelDensity(1);
    createCanvas(500, 500);
    background(128);
    noStroke();

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // listen for all previously drawn shapes (this should trigger the first time 
    // we connect to the server)
    socket.on('previous_shapes', function(allShapes) {
        console.log("All previous shapes were received!");
        console.log(allShapes);

        for (let i = 0; i < allShapes.length; i++) {
            fill(allShapes[i].c);
            ellipse(allShapes[i].x, allShapes[i].y, 20, 20);  
        }
    });

    // listen for new ellipses that have been added by other clients
    socket.on('new_ellipse', function(msg) {

        console.log("A new ellipse message was received!");
        console.log(msg);

        // use the info in the message to draw the ellipse
        fill(msg.c);
        ellipse(msg.x, msg.y, 20, 20);

    });
}

function draw() {

}

// note: this approach may have performance issues when you are dealing with lots of clients

// draw an ellipse when the mouse is initially pressed
function mousePressed() {

    // grab the color from the color picker
    currentColor = document.querySelector('#color_picker').value;
    fill(currentColor);

    // draw an ellipse here
    ellipse(mouseX, mouseY, 20, 20);

    // emit a message to other clients to draw an ellipse here
    socket.emit('new_ellipse', {
        x: mouseX, y: mouseY, c: currentColor
    });

}

// triggered when the mouse is moved and the button is pressed
function mouseDragged() {
    
    // draw an ellipse here
    ellipse(mouseX, mouseY, 20, 20);

    // emit a message to other clients to draw an ellipse here
    socket.emit('new_ellipse', {
        x: mouseX, y: mouseY, c: currentColor
    });
}
