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

    // define our desired movement speed
    this.speed = 3;

    // define our falling speed
    this.fallSpeed = 0;

    // define our jumping power
    this.jumpPower = 0;

    // set up jump "cooldown" mode to prevent spamming of the jump button
    this.jumpCooldown = 0;
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

    // apply gravity to us every frame!
    // get the tile below us
    var belowTile = this.world.getTile(this.bottom[0], this.bottom[1]);

    // is it solid?
    if (!this.world.isTileSolid(belowTile)) {
      // apply gravity
      this.fallSpeed += this.world.gravity;

      // make sure that gravity doesn't get too out of control
      this.fallSpeed = constrain(this.fallSpeed, 0, this.world.gravityMax);

      // update position based on fall speed
      this.y += this.fallSpeed;
    }
    // otherwise it is solid - stop falling
    else {
      this.fallSpeed = 0;
    }

    // decrease jump power, if necessary
    this.jumpPower -= this.world.gravity;
    if (this.jumpPower < 0) {
      this.jumpPower = 0;
    }

    // apply jump power
    this.y -= this.jumpPower;

    // decrease jump "cooldown" mode, if necessary
    this.jumpCooldown--;
    if (this.jumpCooldown < 0) {
        this.jumpCooldown = 0;
    }

    // see if one of our movement keys is down -- if so, we should try and move
    // note that this character responds to the following key combinations:
    // WASD
    // wasd
    // The four directional arrows
    if (keyIsDown(LEFT_ARROW) || keyIsDown(97) || keyIsDown(65)) {

      // see which tile is to our left
      var tile = this.world.getTile(this.left[0], this.left[1]);

      // is this tile solid?
      if (!this.world.isTileSolid(tile)) {
        // move
        this.x -= this.speed;
      }

      // change artwork
      this.currentImage = this.artworkLeft;
      this.displaySensor("left");
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(100) || keyIsDown(68)) {
      // see which tile is to our right
      var tile = this.world.getTile(this.right[0], this.right[1]);

      // is this tile solid?
      if (!this.world.isTileSolid(tile)) {
        // move
        this.x += this.speed;
      }

      // change artwork
      this.currentImage = this.artworkRight;
      this.displaySensor("right");
    }

    // note that the "up' arrow now controls jumping and does not cause the character to
    // directly move up
    if (keyIsDown(UP_ARROW) || keyIsDown(119) || keyIsDown(87)) {
      // see which tile is below us
      var tile = this.world.getTile(this.top[0], this.top[1]);

      // see if the tile below us is solid
      if (this.world.isTileSolid(belowTile)) {
        // are we out of jump "cooldown" mode?
        if (this.jumpCooldown <= 0) {
            // give us some jumping power
            this.jumpPower = 4;

            // put us into jump "cooldown" mode
            this.jumpCooldown = 30;
        }
      }

      // is the tile above solid?
      if (this.world.isTileSolid(tile)) {
        // negate jump power
        this.jumpPower = 0;
      }

      // change artwork
      this.currentImage = this.artworkUp;
      this.displaySensor("up");
    }
  }
}
