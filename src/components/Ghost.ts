export default class Ghost {
	// color = [blue, orange, pink, red]
	constructor(color, position) {
		this.name = 'ghost_' + color;

		this.spritesheets = {
			afraid: {name: this.name + '_' + 'afraid', path: 'assets/sprites/ghost/ghost_afraid.png'},
			normal: {name: this.name + '_' + 'normal', path: 'assets/sprites/ghost/spr_ghost_' + color + '_0.png'},
		};

		this.width = 32;
		this.height = 32;

		this.velocity = 100;

		this.sprite = null;
		
		this.directions = {up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT', none: 'NONE'};
        this.turnDirection = this.directions.none;

        this.marker = {x: position.x, y: position.y};
        this.adjacentTiles = {};
        this.turnPoint = {};
	}
}

var _resetVelocity = function(entity) {
    entity.body.velocity.x = 0;
    entity.body.velocity.y = 0;
};

Ghost.prototype.setVelocity = function(velocity) {
	this.velocity = velocity;
}

Ghost.prototype.getVelocity = function() {
	return this.velocity;
}

Ghost.prototype.getSprite = function() {
	return this.sprite;
}

Ghost.prototype.preload = function(game) {
	game.load.spritesheet(this.spritesheets.afraid.name, this.spritesheets.afraid.path, this.width, this.height);
    game.load.image(this.spritesheets.normal.name, this.spritesheets.normal.path, this.width, this.height);
}

Ghost.prototype.setNormal = function() {
	this.sprite.loadTexture(this.spritesheets.normal.name, 0);
}

Ghost.prototype.setAfraid = function() {
	this.sprite.loadTexture(this.spritesheets.afraid.name, 0);
	this.sprite.animations.add(this.spritesheets.afraid.name, null, 2, true);
	this.sprite.play(this.spritesheets.afraid.name);
}

Ghost.prototype.create = function(game) {
	this.sprite = game.add.sprite(this.marker.x, this.marker.y, this.spritesheets.normal.name, 0);
	this.sprite.anchor.set(0.5);
	this.sprite.angle = 0;
    game.physics.arcade.enable(this.sprite);
}

Ghost.prototype.move = function(direction) {
	switch (this.turnDirection) {
		case this.directions.up:
			_resetVelocity(this.sprite);
	    	this.sprite.body.velocity.y = -this.velocity;
			break;
		case this.directions.right:
			_resetVelocity(this.sprite);
			// Flip horizontally to match direction
			if (this.sprite.scale.x < 0) {
				this.sprite.scale.x *= -1;
			}
	        this.sprite.body.velocity.x = this.velocity;
			break;
		case this.directions.down:
			_resetVelocity(this.sprite);
	        this.sprite.body.velocity.y = this.velocity;
			break;
		case this.directions.left:
			_resetVelocity(this.sprite);
			// Flip horizontally to match direction
			if (this.sprite.scale.x > 0) {
				this.sprite.scale.x *= -1;
			}
	        this.sprite.body.velocity.x = -this.velocity;
			break;
	}
}

Ghost.prototype.checkDirection = function(direction, game) {

	if (this.turnDirection == direction) {
		return;
	} else if (this.adjacentTiles[direction] == null) {
		return;
	} else if (this.adjacentTiles[direction].collides) {
		return;
	}


	this.turning = direction;

    this.turnPoint.x = (this.marker.x * this.width) + (this.width / 2);
    this.turnPoint.y = (this.marker.y * this.height) + (this.height / 2);

    if (game.math.fuzzyEqual(this.sprite.x, this.turnPoint.x, 6) ||
    	game.math.fuzzyEqual(this.sprite.y, this.turnPoint.y, 6)) {

    	this.turnDirection = direction;

    	this.sprite.x = this.turnPoint.x;
		this.sprite.y = this.turnPoint.y;

		this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);

		this.move(this.turning);

		this.turning = this.directions.none;
    }    
}

Ghost.prototype.getAdjacentTiles = function(game) {
	this.marker.x = game.math.snapToFloor(Math.floor(this.sprite.x), this.width) / this.height;
	this.marker.y = game.math.snapToFloor(Math.floor(this.sprite.y), this.width) / this.height;

	var i = game.wall_layer.index;
	var x = this.marker.x;
	var y = this.marker.y;

	this.adjacentTiles[this.directions.left] = game.map.getTileLeft(i, x, y);
	this.adjacentTiles[this.directions.right] = game.map.getTileRight(i, x, y);
	this.adjacentTiles[this.directions.up] = game.map.getTileAbove(i, x, y);
	this.adjacentTiles[this.directions.down] = game.map.getTileBelow(i, x, y);
}

Ghost.prototype.getIntersection = function() {
	let intersection = [];

	if (!this.adjacentTiles[this.directions.left].collides) {
		intersection.push(this.directions.left);
	}
	if (!this.adjacentTiles[this.directions.right].collides) {
		intersection.push(this.directions.right);
	}
	if (!this.adjacentTiles[this.directions.up].collides) {
		intersection.push(this.directions.up);
	}
	if (!this.adjacentTiles[this.directions.down].collides) {
		intersection.push(this.directions.down);
	}

	return intersection;
}

Ghost.prototype.update = function(game) {
	this.getAdjacentTiles(game);


	if (this.turnDirection == this.directions.none) {
		let intersection = this.getIntersection();

		if (intersection.length > 0) {
			let randomDirection = Math.floor(Math.random() * intersection.length);
			let turnDirection = intersection[randomDirection];

			this.checkDirection(turnDirection, game);
		}
	}
	
}