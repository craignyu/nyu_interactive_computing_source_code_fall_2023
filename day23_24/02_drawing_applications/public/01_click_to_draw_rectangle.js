// define our rectangle size
const RECT_SIZE = 10;

// our socket connection variable - this is what allows us to send and receive
// messages from the server
let socket;

function setup() {
    createCanvas(500, 500);
    background(128);
    noStroke();

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // listen for new rectangles that have been drawn by other clients
    socket.on('new_rectangle', function(msg) {

        console.log("A new rectangle message was received!");
        console.log(msg);

        // use the info in the message to draw a new rectangle
        fill(msg.color);
        rect(msg.x, msg.y, RECT_SIZE, RECT_SIZE);    
    });
}

function draw() {

}

function mousePressed() {
    // grab the color from the color picker
    let c = document.querySelector('#color_picker').value;
    fill(c);

    // draw a rectangle here
    rect( int(mouseX/RECT_SIZE)*RECT_SIZE, int(mouseY/RECT_SIZE)*RECT_SIZE, RECT_SIZE, RECT_SIZE);

    // emit a message to the server to tell it that we just drew a rectangle here
    socket.emit('new_rectangle', {
        color: c,
        x: int(mouseX/RECT_SIZE)*RECT_SIZE,
        y: int(mouseY/RECT_SIZE)*RECT_SIZE
    });
}
