
export default class Pacman {
    
    name: string = 'pacman';

    speed: number = 100;

    sprite: Phaser.Sprite = null;

    directions = { up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT', none: 'NONE' };
    turnDirection = this.directions.none;

    marker = { x: 336, y: 560 };
    adjacentTiles = {};
    turning: any = null;
    turnPoint: any = {};

    // Refs
    state: any = null;

    constructor(state: any) {
        this.state = state;

        this.sprite = state.add.sprite(this.marker.x, this.marker.y, 'pacman_walk', 0);
        this.sprite.anchor.set(0.5);
        this.sprite.angle = 0;
        this.sprite.animations.add('packman_walk', null, 6, true);
        state.physics.arcade.enabled(this.sprite);

        this.sprite.play('packman_walk');
    }

    // Public
    move(direction) {
        this._resetVelocity(this.sprite);
        switch (this.turnDirection) {
            case this.directions.up:
                this.sprite.angle = 270;
                this.sprite.body.velocity.y = -this.speed;
                break;
            case this.directions.right:
                this.sprite.angle = 0;
                this.sprite.body.velocity.x = this.speed;
                break;
            case this.directions.down:
                this.sprite.angle = 90;
                this.sprite.body.velocity.y = this.speed;
                break;
            case this.directions.left:
                this.sprite.angle = 180;
                this.sprite.body.velocity.x = -this.speed;
                break;
        }
    }

    checkDirection(direction) {
        if (this.turnDirection == direction || this.adjacentTiles[direction] == null || this.adjacentTiles[direction].collides) {
            return;
        }

        this.turning = direction;
        this.turnPoint.x = (this.marker.x * 32) + (32 / 2);
        this.turnPoint.y = (this.marker.y * 32) + (32 / 2);

        var math: any = this.state.game.math;
        if (math.fuzzyEqual(this.sprite.x, this.turnPoint.x, 6) || math.fuzzyEqual(this.sprite.y, this.turnPoint.y, 6)) {
            this.turnDirection = direction;
            this.sprite.x = this.turnPoint.x;
            this.sprite.y = this.turnPoint.y;

            this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);

            this.move(this.turning);
            this.turning = this.directions.none;
        }
    }

    eatPill() {
        this.state.AddToScore(this.state.pillPoints);
    }

    handleInput() {
        if (this.state.cursors.up.isDown) {
            this.checkDirection(this.directions.up);
        } else if (this.state.cursors.down.isDown) {
            this.checkDirection(this.directions.down);
        } else if (this.state.cursors.right.isDown) {
            this.checkDirection(this.directions.right);
        } else if (this.state.cursors.left.isDown) {
            this.checkDirection(this.directions.left);
        }
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    getAdjacentTiles() {
        var math: any = this.state.game.math;
        this.marker.x = math.snapToFloor(Math.floor(this.sprite.x), 32) / 32;
        this.marker.y = math.snapToFloor(Math.floor(this.sprite.y), 32) / 32;

        var i = this.state.wall_layer.index;
        var x = this.marker.x;
        var y = this.marker.y;

        this.adjacentTiles[this.directions.left] = this.state.map.getTileLeft(i, x, y);
        this.adjacentTiles[this.directions.right] = this.state.map.getTileRight(i, x, y);
        this.adjacentTiles[this.directions.up] = this.state.map.getTileAbove(i, x, y);
        this.adjacentTiles[this.directions.down] = this.state.map.getTileBelow(i, x, y);
    }

    update() {
        this.getAdjacentTiles();
        this.handleInput();
    }

    // Private 
    private _resetVelocity = function(entity) {
        entity.body.velocity.x = 0;
        entity.body.velocity.y = 0;
    }
}