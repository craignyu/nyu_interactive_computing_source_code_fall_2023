// define our rectangle size
const RECT_SIZE = 10;

function setup() {
    createCanvas(500, 500);
    background(128);
    noStroke();
}

function draw() {

}

function mousePressed() {
    // grab the color from the color picker
    let c = document.querySelector('#color_picker').value;
    fill(c);

    // draw a rectangle here
    rect( int(mouseX/RECT_SIZE)*RECT_SIZE, int(mouseY/RECT_SIZE)*RECT_SIZE, RECT_SIZE, RECT_SIZE);
}