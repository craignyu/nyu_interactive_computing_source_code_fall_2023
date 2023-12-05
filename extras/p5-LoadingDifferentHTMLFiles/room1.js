let x = 250;
let y = 250;

function setup() {
    createCanvas(500,500);
    background(128);
}

function draw() {
    background(128);

    text("Move to the right side of the canvas to go to room #2", 20, 20);

    ellipse(x,y,25,25);

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

    x = constrain(x, 0, width);
    y = constrain(y, 0, height);

    if (x > 475) {
        window.location.href = 'room2.html';
    }
}
