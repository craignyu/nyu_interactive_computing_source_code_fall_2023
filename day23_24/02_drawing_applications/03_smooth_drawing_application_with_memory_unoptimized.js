// define the port that this project should listen on
const port = 60003;

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

// read the HTML file for this demo into memory from the 'public' directory
const fs = require('fs');
const htmlFile = fs.readFileSync('./public/03_smooth_drawing_application_with_memory_unoptimized.html', 'utf-8');

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

// an array to hold all previously drawn shapes
const allShapes = [];

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // when a client connects for the first time we should send them all of our 
    // previously drawn shapes
    socket.emit('previous_shapes', allShapes);

    // listen for specific messages from clients
    socket.on('new_ellipse', function(msg) {
        console.log("a new ellipse was added by one of our clients:", msg);

        // save a copy of this shape into our allShapes array
        allShapes.push( msg );

        // send this message to ALL other clients
        socket.broadcast.emit('new_ellipse', msg);
    });


});