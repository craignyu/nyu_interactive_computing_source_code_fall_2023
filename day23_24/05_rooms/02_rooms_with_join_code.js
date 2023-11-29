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
const htmlFile = fs.readFileSync('./public/02_rooms_with_join_code.html', 'utf-8');
const htmlFileAdmin = fs.readFileSync('./public/02_rooms_with_join_code_admin.html', 'utf-8');

// tell the server to send out the HTML file for this demo when it gets contacted
app.get("/", function(request, response) {
    // tell the user they should expect HTML
    response.type('html');

    // send the HTML file to the browser
    response.write(htmlFile);

    // tell the browser we are done!
    response.end();
});

// send out this HTML file if we are trying to access the 'admin' page
app.get("/admin", function(request, response) {
    // tell the user they should expect HTML
    response.type('html');

    // send the HTML file to the browser
    response.write(htmlFileAdmin);

    // tell the browser we are done!
    response.end();
});

// start up the server (go to your browser and visit localhost:port)
server.listen(port, () => {
    console.log(`listening on :${port}`);
});




// your custom code for faciltating communication with clients can be written below

const allRooms = {};

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // admin message handlers
    socket.on('admin_create_room', function(msg) {
        let roomId = parseInt( Math.random() * 999999 + 10000 );
        console.log(roomId);
        allRooms[roomId] = [];
        socket.emit('admin_create_room', {
            id: roomId
        });
    });

    // the user's current room (will be set later)
    let myRoom;

    // listen for room change messages
    socket.on('room_change', function(msg) {

        // is this a valid room?
        if (allRooms[msg.join_code]) {
            // leave our current room (if we are in one)
            if (myRoom) {
                socket.leave(myRoom);
            }

            // set our new room
            myRoom = msg.join_code;

            // join this room
            socket.join(myRoom);

            // send back the previous rectangles for this room
            socket.emit('room_change_successful', allRooms[myRoom]);
        }
        else {
            // leave our current room (if we are in one)
            if (myRoom) {
                socket.leave(myRoom);
            }

            myRoom = undefined;

            // send back an error
            socket.emit('room_change_failed', {});
        }

    })
    
    // adding new rectangles
    socket.on('new_rectangle', function(msg) {
        console.log("a new rectangle was drawn by one of our clients:", msg);

        // store this rectangle in our array so that we can "catch up" new clients
        // with the current drawing
        allRooms[myRoom].push( msg );

        // send this message to ALL other clients
        socket.to(myRoom).emit('new_rectangle', msg);
    });


});


