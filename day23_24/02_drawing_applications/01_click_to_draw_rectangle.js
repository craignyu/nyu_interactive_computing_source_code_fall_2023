// define the port that this project should listen on
const port = 60001;

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
const htmlFile = fs.readFileSync('./public/01_click_to_draw_rectangle.html', 'utf-8');

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

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // listen for specific messages from clients
    socket.on('new_rectangle', function(msg) {
        console.log("a new rectangle was drawn by one of our clients:", msg);

        // send this message to ALL other clients
        socket.broadcast.emit('new_rectangle', msg);
    });


});


