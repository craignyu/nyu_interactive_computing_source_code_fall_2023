// define our rectangle size
const RECT_SIZE = 10;

// our socket connection variable - this is what allows us to send and receive
// messages from the server
let socket;

// are we in a room?
let joinSuccessful = false;

function setup() {
    createCanvas(500, 500).parent('#game_div');
    background(128);
    noStroke();

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // was the room change successful?
    socket.on('room_change_failed', function(message) {
        document.getElementById('join_failed').classList.remove('hidden');
        document.getElementById('game_div').classList.add('hidden');
        joinSuccessful = false;
    })

    socket.on('room_change_successful', function(allRectangles) {
        console.log("Join successful!");
        console.log(allRectangles);
        joinSuccessful = true;

        document.getElementById('join_failed').classList.add('hidden');
        document.getElementById('game_div').classList.remove('hidden');

        // erase the current room
        background(128);

        for (let i = 0; i < allRectangles.length; i++) {
            fill(allRectangles[i].color);
            rect(allRectangles[i].x, allRectangles[i].y, RECT_SIZE, RECT_SIZE);  
        }
    })

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
    // don't do anything if we aren't in a room yet
    if (joinSuccessful == false) {
        return;
    }

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


function joinRoom() {
    // grab the join_code from the form
    let join_code = document.getElementById('join_code').value;

    // tell the server that we want to change to this room
    socket.emit('room_change', {
        join_code: join_code
    });
}
