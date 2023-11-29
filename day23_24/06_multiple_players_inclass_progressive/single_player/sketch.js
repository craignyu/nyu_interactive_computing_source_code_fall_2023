// position of the user controlled character
let x, y;

// color selected by the user
let currentColor;

function setup() {
    createCanvas(800, 600);
    background(128);
    noStroke();

    // grab the color from the HTML form
    currentColor = document.getElementById('color_picker').value;

    // pick a random starting spot
    x = random(width);
    y = random(height);
}

function draw() {
    background(128);

    // draw our character
    fill(currentColor);
    ellipse(x, y, 20, 20);

    // move our character
    if (keyIsDown(LEFT_ARROW)) {
        x -= 3;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        x += 3;
    }
    if (keyIsDown(UP_ARROW)) {
        y -= 3;
    }
    if (keyIsDown(DOWN_ARROW)) {
        y += 3;
    }

    // constrain our position to the visible canvas
    x = constrain(x, 0, width);
    y = constrain(y, 0, height);
}

function changeColor() {
    currentColor = document.getElementById('color_picker').value;
}