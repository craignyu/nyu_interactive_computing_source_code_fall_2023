class Player {
  constructor(x, y, tileSize, artLeft, artRight, artUp, artDown, world) {
    // store the player position
    this.x = x;
    this.y = y;

    // store our tile size
    this.tileSize = tileSize;

    // store a reference to our "world" object - we will ask the world to tell us about
    // tiles that are in our path
    this.world = world;

    // load & store our artwork
    this.artworkLeft = artLeft;
    this.artworkRight = artRight;
    this.artworkUp = artUp;
    this.artworkDown = artDown;

    // assume we are pointing to the right
    this.currentImage = this.artworkRight;

    // define our speed
    this.speed = 3;
  }

  // display our player
  display() {
    imageMode(CORNER);
    image(this.currentImage, this.x, this.y, this.tileSize, this.tileSize);
  }

  // display "sensor" positions
  displaySensor(direction) {
    fill(255);
    if (direction == "up") {
      ellipse(this.top[0], this.top[1], 10, 10);
    } else if (direction == "down") {
      ellipse(this.bottom[0], this.bottom[1], 10, 10);
    } else if (direction == "right") {
      ellipse(this.right[0], this.right[1], 10, 10);
    } else if (direction == "left") {
      ellipse(this.left[0], this.left[1], 10, 10);
    }
  }

  // set our sensor positions (computed based on the position of the character and the
  // size of our graphic)
  refreshSensors() {
    this.left = [this.x, this.y + this.tileSize / 2];
    this.right = [this.x + this.tileSize, this.y + this.tileSize / 2];
    this.top = [this.x + this.tileSize / 2, this.y];
    this.bottom = [this.x + this.tileSize / 2, this.y + this.tileSize];
  }

  // move our character
  move() {
    // refresh our "sensors" - these will be used for movement & collision detection
    this.refreshSensors();

    // see if one of our movement keys is down -- if so, we should try and move
    // note that this character responds to the following key combinations:
    // WASD
    // wasd
    // The four directional arrows
    if (keyIsDown(LEFT_ARROW) || keyIsDown(97) || keyIsDown(65)) {

      // see which tile is to our left
      let tile = this.world.getTile(this.left[0], this.left[1]);

      // would moving in this direction require a room change?
      if (tile == "roomChange") {
        // ask the world to request a room change
        this.world.changeRoom("left");

        // move the player into the new room
        this.x = width - this.currentImage.width;
      }

      // otherwise this is a regular tile
      else {

        // is this tile solid?
        if (!this.world.isTileSolid(tile)) {
          // move
          this.x -= this.speed;
        }
      }

      // change artwork
      this.currentImage = this.artworkLeft;
      this.displaySensor("left");
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(100) || keyIsDown(68)) {
      // see which tile is to our right
      let tile = this.world.getTile(this.right[0], this.right[1]);

      // would moving in this direction require a room change?
      if (tile == "roomChange") {
        // ask the world to request a room change
        this.world.changeRoom("right");

        // move the player into the new room
        this.x = 0 + this.currentImage.width;
      }

      // otherwise this is a regular tile
      else {

        // is this tile solid?
        if (!this.world.isTileSolid(tile)) {
          // move
          this.x += this.speed;
        }
      }

      // change artwork
      this.currentImage = this.artworkRight;
      this.displaySensor("right");
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(115) || keyIsDown(83)) {
      // see which tile is below us
      let tile = this.world.getTile(this.bottom[0], this.bottom[1]);

      // would moving in this direction require a room change?
      if (tile == "roomChange") {
        // ask the world to request a room change
        this.world.changeRoom("down");

        // move the player into the new room
        this.y = 0 + this.currentImage.height;
      }

      // otherwise this is a regular tile
      else {

        // is this tile solid?
        if (!this.world.isTileSolid(tile)) {
          // move
          this.y += this.speed;
        }
      }

      // change artwork
      this.currentImage = this.artworkDown;
      this.displaySensor("down");
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(119) || keyIsDown(87)) {
      // see which tile is below us
      let tile = this.world.getTile(this.top[0], this.top[1]);

      // would moving in this direction require a room change?
      if (tile == "roomChange") {
        // ask the world to request a room change
        this.world.changeRoom("up");

        // move the player into the new room
        this.y = height - this.currentImage.height;
      }

      // otherwise this is a regular tile
      else {

        // is this tile solid?
        if (!this.world.isTileSolid(tile)) {
          // move
          this.y -= this.speed;
        }
      }

      // change artwork
      this.currentImage = this.artworkUp;
      this.displaySensor("up");
    }
  }
}
