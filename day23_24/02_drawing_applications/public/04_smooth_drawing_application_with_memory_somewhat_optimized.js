// our socket connection variable - this is what allows us to send and receive
// messages from the server
let socket;

// the current color that the user has selected
let currentColor;

// create a message array -- we will send out the contents of this array to the server
// on a less frequent basis, which will help to keep the # of network messages to a minimum
let messageArray = [];

// flag to keep track of when we are in drawing mode
let drawMode = false;

// keep track of the previously stored point
let previousX, previousY;

function setup() {
    pixelDensity(1);
    createCanvas(500, 500);
    background(128);
    noStroke();

    // get the current color from the color picker
    currentColor = document.querySelector('#color_picker').value;

    // every 200ms we should contact the server with any messages that need
    // to be delivered to the other clients
    setInterval(function() {
        // if there is at least one message to send
        if (messageArray.length > 0) {

            // emit our current package of messages
            socket.emit('new_message', {
                c: currentColor, 
                p: messageArray
            });

            // clear the messageArray
            messageArray = [];
        }
    }, 200);

    // set up a socket connection with the server
    // this will allow us to send messages to the server, which can then be configured
    // to send messages out to all other clients who are currently connected
    socket = io();

    // listen for all previously drawn shapes (this should trigger the first time 
    // we connect to the server)
    socket.on('previous_messages', function(allMessages) {
        console.log("All previous messages were received!");
        console.log(allMessages);

        for (let i = 0; i < allMessages.length; i++) {
            fill(allMessages[i].c);
            for (let j = 0; j < allMessages[i].p.length; j+=2) {
                ellipse(allMessages[i].p[j], allMessages[i].p[j+1], 20, 20);
            }
        }
    });

    // listen for new ellipses that have been added by other clients
    socket.on('new_message', function(msg) {

        console.log("A new ellipse message was received!");
        console.log(msg);

        // use the info in the message to draw the ellipse
        fill(msg.c);
        for (let i = 0; i < msg.p.length; i+=2) {
            ellipse(msg.p[i], msg.p[i+1], 20, 20);
        }

    });
}

function draw() {

}

// note: this approach may also have performance issues when you are dealing with lots of clients

// draw an ellipse when the mouse is initially pressed
function mousePressed() {
    // we only care about ellipses that are on-screen
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }

    // indicate that we are in drawing mode
    drawMode = true;

    // grab the color from the color picker
    currentColor = document.querySelector('#color_picker').value;
    fill(currentColor);

    // draw an ellipse here
    ellipse(int(mouseX), int(mouseY), 20, 20);

    // store this ellipse in our messageArray
    messageArray.push(int(mouseX),int(mouseY));

    // keep track of this as our previous stored point
    previousX = int(mouseX);
    previousY = int(mouseY);
}

// triggered when the mouse is moved and the button is pressed
function mouseDragged() {

    // only store a message if we are in draw mode
    if (!drawMode) {
        return;
    }

    // only store a message if the point is different than the last one
    if (int(mouseX) == previousX && int(mouseY) == previousY) {
        return;
    }
    
    // draw an ellipse here
    fill(currentColor);
    ellipse(int(mouseX), int(mouseY), 20, 20);

    // store this ellipse in our messageArray
    messageArray.push(int(mouseX),int(mouseY));

    // keep track of this as our previous stored point
    previousX = int(mouseX);
    previousY = int(mouseY);    
}

// when the mouse has been released we can also release drawMode
function mouseReleased() {
    drawMode = false;
}