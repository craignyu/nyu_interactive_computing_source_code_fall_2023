// variable to hold a reference to our A-Frame world
let world;

function setup() {
	// no canvas needed
	noCanvas();

	// construct the A-Frame world
	// this function requires a reference to the ID of the 'a-scene' tag in our HTML document
	world = new World('VRScene');

	// change the background color of the world
	world.setBackground(0,0,0);

	// what textures can we choose from?
	let textures = ['iron', 'gold', 'stone'];

	// create lots of boxes
	for (let i = 0; i < 150; i++) {
		// pick a location
		let x = random(-50, 50);
		let z = random(-50, 50);

		// pick a random texture
		let t = textures[ int(random(textures.length)) ];

		// create a box here
		// note the inclusion of a 'clickFunction' property - this function will be invoked
		// every time this box is clicked on.  note that the function accepts a single argument
		// -- this is a reference to the box that was clicked (essentially the entity itself)
		let b = new Box({
							x:x,
							y:0.5,
							z:z,
							width: 1,
							height: 1,
							depth: 1,
							asset:t,
							clickFunction: function(theBox) {
								// update color
								theBox.setColor( random(255), random(255), random(255) );

								// or hide it!
								//theBox.hide();

								// move the user toward this box over a 2 second period
								// (time is expressed in milliseconds)
								world.slideToObject( theBox, 2000 );
							}
		});

		// add the box to the world
		world.add(b);
	}



	// create a bunch of boxes in the sky as well
	for (let i = 0; i < 150; i++) {
		// pick a location
		let x = random(-50, 50);
		let y = 10;
		let z = random(-50, 50);

		// create a box here
		// note the inclusion of a 'clickFunction' property - this function will be invoked
		// every time this box is clicked on.  note that the function accepts a single argument
		// -- this is a reference to the box that was clicked (essentially the entity itself)
		let s = new Box({
							x:x,
							y:y,
							z:z,
							red: random(255), green: random(255), blue: random(255),
							clickFunction: function(theBox) {
								// update color
								theBox.setColor( random(255), random(255), random(255) );

								// teleport the user here immediately
								world.teleportToObject( theBox );
							}
		});

		// add the box to the world
		world.add(s);
	}



	// create a plane to serve as our "ground"
	let g = new Plane({
						x:0, y:0, z:0,
						width:100, height:100,
						asset: 'stone',
						repeatX: 100,
						repeatY: 100,
						rotationX:-90, metalness:0.25
					   });

	// add the plane to our world
	world.add(g);
}

function draw() {

}
