let r = 255;
let g = 255;
let b = 255;

// setup function - used for commands that need to run only once
function setup() {
  createCanvas(500,500);
  background(0);
  strokeWeight(10);
}

// draw function - used for commands that need to be repeated
function draw() {

  if (mouseIsPressed == true) {
    stroke(r,g,b);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }

}

function keyPressed() {

  // check if the 'C' key was pressed
  if (key == 'c' || key == 'C') {
    r = random(0,255);
    g = random(0,255);
    b = random(0,255);

    fill(r,g,b);
    rect(0,0,20,20);
  }

}
