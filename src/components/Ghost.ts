
export default class Ghost {

    name: string = null;

    speed: number = 100;

    sprite: Phaser.Sprite = null;

    directions = { up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT', none: 'NONE' };
    turnDirection = this.directions.none;

    marker: any = null;
    adjacentTiles: any = {};
    turning: any = {};
    turnPoint: any = {};

    // Refs
    state: any = null;

    constructor(state: any, name: string, posX: number, posY: number) {
        this.state = state;

        this.name = `ghost_${name}`;
        this.marker = { x: posX, y: posY };

        this.sprite = state.add.sprite(posX, posY, `${this.name}_normal`, 0);
        this.sprite.anchor.set(0.5);
        this.sprite.angle = 0;
        state.physics.arcade.enable(this.sprite);
    }

    // Public
    move(direction) {
        this._resetVelocity(this.sprite);
        switch (this.turnDirection) {
            case this.directions.up:
                this.sprite.body.velocity.y = -this.speed;
                break;
            case this.directions.right:
                // Flip horizontally to match direction
                if (this.sprite.scale.x < 0) {
                    this.sprite.scale.x *= -1;
                }    

                this.sprite.body.velocity.x = this.speed;
                break;
            case this.directions.down:
                this.sprite.angle = 90;
                this.sprite.body.velocity.y = this.speed;
                break;
            case this.directions.left:
                // Flip horizontally to match direction
                if (this.sprite.scale.x > 0) {
                    this.sprite.scale.x *= -1;
                }     
            
                this.sprite.body.velocity.x = -this.speed;
                break;
        }
    }

    checkDirection(direction) {
        if (this.turnDirection == direction || this.adjacentTiles[direction] == null || this.adjacentTiles[direction].collides) {
            return
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

    setNormal() {
        this.sprite.loadTexture(`${this.name}_normal`, 0);
    }

    setAfraid() {
        this.sprite.loadTexture(`${this.name}_afraid`, 0);
        this.sprite.animations.add(`${this.name}_afraid`, null, 2, true);
        this.sprite.play(`${this.name}_afraid`);
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

    getIntersection() {
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

    update() {
        this.getAdjacentTiles();

        if (this.turnDirection == this.directions.none) {
            let intersection = this.getIntersection();
            if (intersection.length > 0) {
                let randomDirection = Math.floor(Math.random() * intersection.length);
                let turndirection = intersection[randomDirection];

                this.checkDirection(turndirection);
            }
        }
    }

    // Private 
    private _resetVelocity = function(entity) {
        entity.body.velocity.x = 0;
        entity.body.velocity.y = 0;
    }
}