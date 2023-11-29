// define the port that this project should listen on
const port = 60002;

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

// set up the uniqid library so we can create unique identifiers for our players
const uniqid = require('uniqid');

// read the HTML file for this demo into memory from the 'public' directory
const fs = require('fs');
const htmlFile = fs.readFileSync('./public/01_pixel_drawing_application_with_rooms.html', 'utf-8');

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

// create an array to store all rectangles that have been drawn by all clients.
// we can use this information to let new clients know what has been drawn so far
// note that we will keep a memory of the drawings for each room in our application
const allRectangles = {
    'room1':[],
    'room2':[],
    'room3':[]
};

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // assign all clients to room 1
    let myRoom = 'room1';
    socket.join(myRoom);

    // when a client connects for the first time we should send them all of our 
    // previously drawn rectangles
    socket.emit('previous_rectangles', allRectangles[myRoom]);

    // listen for room change messages
    socket.on('room_change', function(msg) {
        // leave our current room
        socket.leave(myRoom);
        
        // set our new room
        myRoom = msg.roomId;

        // join this room
        socket.join(myRoom);

        // send back the previous rectangles for this room
        socket.emit('previous_rectangles', allRectangles[myRoom]);
    })

    // listen for specific messages from clients
    socket.on('new_rectangle', function(msg) {
        console.log("a new rectangle was drawn by one of our clients:", msg);

        // store this rectangle in our array so that we can "catch up" new clients
        // with the current drawing
        allRectangles[myRoom].push( msg );

        // send this message to ALL other clients
        socket.to(myRoom).emit('new_rectangle', msg);
    });


});


