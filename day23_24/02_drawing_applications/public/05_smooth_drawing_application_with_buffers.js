// define our rectangle size
const RECT_SIZE = 10;

// our socket connection variable - this is what allows us to send and receive
// messages from the server
let socket;

// an off screen graphics buffer to handle temporary drawing
let tempDrawing;

// an off screen graphics buffer to handle the final drawing
let finalDrawing;

function setup() {
    pixelDensity(1);
    createCanvas(500, 500);
    background(128);

    // create our off screen graphics buffers
    tempDrawing = createGraphics(500,500);
    tempDrawing.pixelDensity(1);
    finalDrawing = createGraphics(500,500);
    finalDrawing.pixelDensity(1);

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

            // use the info in the message to draw to the finalDrawing buffer
            loadImage( allMessages[i].data, function(img) {
                console.log("Loaded PNG string results in an image of size:", img.width, img.height);
                finalDrawing.image(img, allMessages[i].x, allMessages[i].y);
            });

        }
    });


    // listen for new drawings that have been added by other clients
    socket.on('new_drawing', function(msg) {

        console.log("A new drawing message was received!");
        console.log(msg);

        // use the info in the message to draw to the finalDrawing buffer
        loadImage( msg.data, function(img) {
            console.log("Loaded PNG string results in an image of size:", img.width, img.height);
            finalDrawing.image(img, msg.x, msg.y);
        })
    });
}

function draw() {
    // when the user draws we should draw to our tempDrawing off screen graphics buffer
    if (mouseIsPressed) {
        // grab the color from the color picker
        let c = document.querySelector('#color_picker').value;
        tempDrawing.fill(c);
        tempDrawing.noStroke();
        
        // draw an ellipse here
        tempDrawing.ellipse(mouseX, mouseY, 20, 20);
    }

    // erase the background of the main canvas
    background(128);

    // draw the finalDrawing
    image(finalDrawing, 0, 0);

    // draw the tempDrawing
    image(tempDrawing, 0, 0);
}

function mouseReleased() {
    // the mouse was just released, which means the user is done drawing

    // identify the width and height of the shape drawn. we will use this info
    // to create a new buffer of exactly the correct size for the newly added image
    // this will allow us to optimize how we store the image
    tempDrawing.loadPixels();
    let left = undefined;
    let right = undefined;
    let top = undefined;
    let bottom = undefined;
    for (let y = 0; y < 500; y++) {
        for (let x = 0; x < 500; x++) {
            let location = (x + y*500)*4;
            // a solid pixel
            if (tempDrawing.pixels[location+3] == 255) {
                if (left == undefined || x < left) {
                    left = x;
                }
                if (right == undefined || x > right) {
                    right = x;
                }
                if (top == undefined || y < top) {
                    top = y;
                }
                if (bottom == undefined || y > bottom) {
                    bottom = y;
                }
            }
        }
    }
    console.log("Visible dimension of rectangle:", left, right, top, bottom);
    let w = right-left;
    let h = bottom-top;
    console.log("Size of reduced buffer:", w, h);
    let reducedSizeBuffer = createGraphics(w,h);
    reducedSizeBuffer.pixelDensity(1);
    reducedSizeBuffer.copy( tempDrawing, left, top, w, h, 0, 0, w, h);

    // draw this reduced size image to the finalDrawing
    finalDrawing.image(reducedSizeBuffer, left, top);

    // grab the raw string data from the reducedSizeBuffer buffer so we can send this to other clients
    let pngRawImageStringData = reducedSizeBuffer.elt.toDataURL();
    console.log(pngRawImageStringData);

    // erase the tempDrawing graphics buffer so we can reuse it for our next drawing
    tempDrawing.clear();

    // emit a message to the server to tell it that we just added a new drawing
    socket.emit('new_drawing', {
        data: pngRawImageStringData,
        x: left,
        y: top
    });
}
