// basic information about the layout of our grid, including an array to hold all grid elements
let grid = [];
let cellSize = 25;
let gridWidth = 20;
let gridHeight = 20;

// where the creatures start in the grid (0,0) and where they want to get to (19,19)
let startX = 0;
let startY = 0;
let endX = 19;
let endY = 19;

// array to hold all creature objects that will move through the grid
let creatures = [];

// debug mode - show the pathing info for each cell
let debug = false

function setup() {
  createCanvas(500,500);

  // set up our grid
  for (let x = 0; x < gridWidth; x++) {
    let newRow = [];
    for (let y = 0; y < gridHeight; y++) {
      // each cell in our grid holds an object to define its color, whether it is solid, and pathing info, including pointers to the next cell that will bring us closer to the optimal path to
      // the desired end point of the maze
      // we assume at the beginning that we don't know how far it is to get to the end (-1)
      // and we default these pointers to "unknown"
      newRow.push({color:0, solid: false, stepsToEnd: -1, nextX: "unknown", nextY: "unknown", nextDirection: -1});
    }
    grid.push(newRow);
  }

  // find all paths to the end point - there is where the magic happens!
  findPaths();
}

function findPaths() {
  // step 1: clear all existing pathfinding information in the grid
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      grid[i][j].stepsToEnd = -1;
      grid[i][j].nextX = "unknown";
      grid[i][j].nextY = "unknown";
      grid[i][j].dx = 0;
      grid[i][j].dy = 0;
      grid[i][j].nextDirection = -1;
    }
  }

  // step 2: mark the end path as 0 steps
  grid[endX][endY].stepsToEnd = 0;
  grid[endX][endY].nextX = "none";
  grid[endX][endY].nextY = "none";
  grid[endX][endY].dx = 0;
  grid[endX][endY].dy = 0;
  grid[endX][endY].nextDirection = -1;

  // step 3: find all this loop keeps calling 'findPathIterative' until all cells in the grid have
  // pointers to the optimal end path
  while (true) {
    if (findPathIterative() === 0) {
      break;
    }
  }

  // tell all the creatures to recompute their paths
  for (let c in creatures) {
    creatures[c].recomputePath();
  }
}

// this function visits every tile on the page and computes its optimal path to the ending cell
// note that this function gets called multiple times since it only computes the path for cells
// that have existing pathing info (at the beginning this will only be the end cell, followed
// by its direct neighbors, until finally it spreads out to all cells).  we do this iteratively
// since a recursive implementation can be a big memory intensive and can cause performance issues
function findPathIterative() {
  // start off by making a deep copy of the entire array
  let gridCopy = makeDeepCopy(grid);

  // assume we need to make 0 changes to the pathing info in the grid - this is important
  // since if this number fails to change during the computation phase below we can assume
  // that we have computed a valid optimal path to the end cell
  let numChanges = 0;

  // visit every cell in the grid
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      // only need to do something if this is tile is not solid or we know pathing info for the tile already
      if (grid[x][y].solid === false && grid[x][y].stepsToEnd == -1) {
        // check element: RIGHT
        if (x < grid.length-1) {
          // is it solid and do we know the pathfinding info for this tile?
          if (grid[x+1][y].solid === false && grid[x+1][y].stepsToEnd >= 0) {
            // mark this tile with pathfinding info based on the cell we are visiting (+1)
            gridCopy[x][y].stepsToEnd = grid[x+1][y].stepsToEnd+1;
            gridCopy[x][y].nextX = x + 1;
            gridCopy[x][y].nextY = y;
            gridCopy[x][y].dx = 1;
            gridCopy[x][y].dy = 0;
            gridCopy[x][y].nextDirection = "right";

            numChanges++;
          }
        }

        // check element: LEFT
        if (x >= 1) {
          // is it solid and do we know the pathfinding info for this tile?
          if (grid[x-1][y].solid === false && grid[x-1][y].stepsToEnd >= 0) {
            // mark this tile with pathfinding info based on the cell we are visiting (+1)
            gridCopy[x][y].stepsToEnd = grid[x-1][y].stepsToEnd+1;
            gridCopy[x][y].nextX = x-1;
            gridCopy[x][y].nextY = y;
            gridCopy[x][y].dx = -1;
            gridCopy[x][y].dy = 0;
            gridCopy[x][y].nextDirection = "left";

            numChanges++;
          }
        }

        // check element: DOWN
        if (y < grid[x].length-1) {
          // is it solid and do we know the pathfinding info for this tile?
          if (grid[x][y+1].solid === false && grid[x][y+1].stepsToEnd >= 0) {
            // mark this tile with pathfinding info based on the cell we are visiting (+1)
            gridCopy[x][y].stepsToEnd = grid[x][y+1].stepsToEnd+1;
            gridCopy[x][y].nextX = x;
            gridCopy[x][y].nextY = y+1;
            gridCopy[x][y].dx = 0;
            gridCopy[x][y].dy = 1;
            gridCopy[x][y].nextDirection = "down";

            numChanges++;
          }
        }

        // check element: UP
        if (y >= 1) {
          // is it solid and do we know the pathfinding info for this tile?
          if (grid[x][y-1].solid === false && grid[x][y-1].stepsToEnd >= 0) {
            // mark this tile with pathfinding info based on the cell we are visiting (+1)
            gridCopy[x][y].stepsToEnd = grid[x][y-1].stepsToEnd+1;
            gridCopy[x][y].nextX = x;
            gridCopy[x][y].nextY = y-1;
            gridCopy[x][y].dx = 0;
            gridCopy[x][y].dy = -1;
            gridCopy[x][y].nextDirection = "up";

            numChanges++;
          }
        }
      }
    }
  }

  // update the grid with the copy that we made
  grid = gridCopy;

  // tell the caller how many changes we made (if 0 the caller will stop the 'while' loop and a path has been computed)
  return numChanges;
}


function keyPressed() {
  // hitting 'd' will toggle debug mode
  if (keyCode == 68) {
    debug = !debug
  }
}


function draw() {
  // draw the grid
  noStroke();
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      fill( grid[row][col].color );
      rect( row*cellSize, col*cellSize, cellSize, cellSize );

      if (debug) {
        fill(0,255,0)
        text(grid[row][col].stepsToEnd, row*cellSize+cellSize/2, col*cellSize+cellSize/2)        
      }
    }
  }

  // draw start and end points
  noStroke();

  fill(0,255,0,150);
  rect(startX*cellSize, startY*cellSize, cellSize, cellSize);
  fill(0,255,0,150);
  rect(endX*cellSize, endY*cellSize, cellSize, cellSize);

  // draw the mouse indicator
  stroke(255);
  strokeWeight(5);
  noFill();
  let gx = int(mouseX / cellSize);
  let gy = int(mouseY / cellSize);
  rect(gx*cellSize, gy*cellSize, cellSize, cellSize);

  // every 10 frames spawn a creature
  if (frameCount % 10 === 0) {
    creatures.push(new Creature(startX*cellSize + 0.5*cellSize, startY*cellSize + 0.5*cellSize, startX, startY));
  }

  // move and display creatures
  for (let i = 0; i < creatures.length; i++) {
    creatures[i].move();
    creatures[i].display();

    if (creatures[i].isAtEnd()) {
      creatures[i].die();
    }
  }
}

// clicking the mouse will allow you to add obstacles to the grid
function mousePressed() {
  let gx = int(mouseX / cellSize);
  let gy = int(mouseY / cellSize);

  if (!( (gx == startX && gy == startY) || (gx == endX && gy == endY) ) ) {
    if (grid[gx][gy].solid) {
      grid[gx][gy].color = 0;
      grid[gx][gy].solid = false;
    }
    else {
      grid[gx][gy].color = 128;
      grid[gx][gy].solid = true;
    }
  }
  else {
    console.log("can't do that!");
  }

  // every time we click the mouse we need to recompute pathing info for the whole grid
  findPaths();
}


// our Creature class
class Creature {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.nodeX = int( this.x / cellSize );
    this.nodeY = int( this.y / cellSize );
    this.desiredX = grid[this.nodeX][this.nodeY].nextX * cellSize + 0.5*cellSize;
    this.desiredY = grid[this.nodeX][this.nodeY].nextY * cellSize + 0.5*cellSize;
    this.color = color( random(255), random(255), random(255) );

    this.nodeHistory = [];
    this.nodeHistory.push([this.nodeX, this.nodeY]);

    this.dead = false;
  }

  display() {
    if (!this.dead) {
      fill(this.color);
      noStroke();
      ellipse(this.x, this.y, 10, 10);
    }
  }

  die() {
    this.dead = true;
  }

  isAtEnd() {
    if (this.nodeX == endX && this.nodeY == endY) {
      return true;
    }
    return false;
  }

  move() {
    if (!this.dead) {
      // move based on current movement vector
      if (this.x < this.desiredX) {
        this.x += 1;
      }
      else if (this.x > this.desiredX) {
        this.x -= 1;
      }
      if (this.y < this.desiredY) {
        this.y += 1;
      }
      else if (this.y > this.desiredY) {
        this.y -= 1;
      }

      // have we reached our new position?  if so, compute a new node value
      if (dist(this.x, this.y, this.desiredX, this.desiredY) < 2) {
        // snap to our desired position
        this.x = this.desiredX;
        this.y = this.desiredY;

        // note this position
        this.nodeHistory.push([this.nodeX, this.nodeY]);

        // see where we need to go next!
        this.recomputePath();
      }
    }
  }

  recomputePath() {
    if (!this.dead) {
      // compute new node value
      this.nodeX = int( this.x / cellSize );
      this.nodeY = int( this.y / cellSize );

      // add this to our node history
      this.nodeHistory.push([this.nodeX, this.nodeY]);

      // make sure we aren't stuck in a solid tile!
      if (grid[this.nodeX][this.nodeY].solid) {
        // find the most recently visited node that is not solid and move back there
        for (let i = this.nodeHistory.length-1; i >= 0; i--) {
          if (grid[this.nodeHistory[i][0]][this.nodeHistory[i][1]].solid === false) {
            // move back to this previous node
            this.desiredX = this.nodeHistory[i][0] * cellSize + 0.5*cellSize;
            this.desiredY = this.nodeHistory[i][1] * cellSize + 0.5*cellSize;
            break;
          }
        }

        console.log("STUCK!");
      }
      else {
        // compute new desired value
        this.desiredX = grid[this.nodeX][this.nodeY].nextX * cellSize + 0.5*cellSize;
        this.desiredY = grid[this.nodeX][this.nodeY].nextY * cellSize + 0.5*cellSize;
      }
    }
  }
}



// helper function to make a deep copy of the array
function makeDeepCopy(g) {
  let gridCopy = [];

  for (let x = 0; x < g.length; x++) {
    let newRow = [];

    for (let y = 0; y < g[x].length; y++) {
      let newObj = {};

      for (let property in g[x][y]) {
        newObj[property] = g[x][y][property];
      }

      newRow.push(newObj);
    }

    gridCopy.push(newRow);
  }

  return gridCopy;
}
