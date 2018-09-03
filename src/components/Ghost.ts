import BonusGameState from "../states/bonus-game";

export default class Ghost {

    // Refs
    state: BonusGameState;
    math: any;
    gridSize: any;

    // Vars
    name: string;
    color: string;

    sprite: Phaser.Sprite;

    speed = 100;
    scatterSpeed = 75;
    frightenedSpeed = 50;

    startDir: number = null;
    startPos: any = null;
    lastPos: any = null;
    currentDir: number = Phaser.NONE;
    //directions = { up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT', none: 'NONE' };
    directions = [ null, null, null, null, null ];

    //adjacentTiles: any = {};
    turnPoint: any = {};
    //turnDirection = this.directions.none;

    scatterDestination: Phaser.Point;
    ghostDestination: Phaser.Point;

    turnTimer = 0;
    TURNING_COOLDOWN = 150;
    RETURNING_COOLDOWN = 100;
    RANDOM          = "random";
    SCATTER         = "scatter";
    CHASE           = "chase";
    STOP            = "stop";
    AT_HOME         = "at_home";
    EXIT_HOME       = "leaving_home";
    RETURNING_HOME  = "returning_home";
    isAttacking = false;

    mode = this.AT_HOME;

    constructor(state: BonusGameState, name: string, startPos: any, startDir: number) {
        this.state = state;
        this.math = state.game.math;
        this.gridSize = state.gridSize;

        this.name = `ghost_${name}`;
        this.color = name;
        this.startPos = startPos;
        this.startDir = startDir;
        this.lastPos = startPos;

        switch (name) {
            case 'blue':
                // Bottom-Right
                this.scatterDestination = new Phaser.Point(22 * this.gridSize, 17 * this.gridSize);
                break;
            case 'red':
                // Bottom-Left
                this.scatterDestination = new Phaser.Point(2 * this.gridSize, 17 * this.gridSize);
                break;
            case 'orange':
                // Top-Right
                this.scatterDestination = new Phaser.Point(22 * this.gridSize, 3 * this.gridSize);
                break;
            case 'pink':
                // Top-Left
                this.scatterDestination = new Phaser.Point(2 * this.gridSize, 3 * this.gridSize);
                break;
        }
        

        this.sprite = state.add.sprite((startPos.x * this.gridSize) + (this.gridSize / 2), (startPos.y * this.gridSize) + (this.gridSize / 2), `${this.name}_normal`, 0);
        this.sprite.anchor.set(0.5);
        this.sprite.angle = 0;
        state.physics.arcade.enable(this.sprite);
    }

    // Public
    move(direction) {
        this._resetVelocity(this.sprite);
        switch (direction) {
            case Phaser.UP:
                this.sprite.body.velocity.y = -this.speed;
                break;
            case Phaser.RIGHT:
                // Flip horizontally to match direction
                if (this.sprite.scale.x < 0) {
                    this.sprite.scale.x *= -1;
                }    

                this.sprite.body.velocity.x = this.speed;
                break;
            case Phaser.DOWN:
                this.sprite.body.velocity.y = this.speed;
                break;
            case Phaser.LEFT:
                // Flip horizontally to match direction
                if (this.sprite.scale.x > 0) {
                    this.sprite.scale.x *= -1;
                }     
            
                this.sprite.body.velocity.x = -this.speed;
                break;
        }
    }

    checkDirection(direction) {
        if (this.currentDir == direction || this.directions[direction] == null || this.directions[direction].collides) {
            return
        }

        this.turnPoint.x = (this.lastPos.x * this.gridSize) + (this.gridSize / 2);
        this.turnPoint.y = (this.lastPos.y * this.gridSize) + (this.gridSize / 2);

        if (this.math.fuzzyEqual(this.sprite.x, this.turnPoint.x, 6) || this.math.fuzzyEqual(this.sprite.y, this.turnPoint.y, 6)) {
            this.currentDir = direction;
            this.sprite.x = this.turnPoint.x;
            this.sprite.y = this.turnPoint.y;

            this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);

            this.move(direction);
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

    getAdjacentTiles(x, y) {
        var i = this.state.wall_layer.index;
        //var x = this.lastPos.x = this.math.snapToFloor(Math.floor(this.sprite.x), this.gridSize) / this.gridSize;
        //var y = this.lastPos.y = this.math.snapToFloor(Math.floor(this.sprite.y), this.gridSize) / this.gridSize;

        // this.adjacentTiles[this.directions.left] = this.state.map.getTileLeft(i, x, y);
        // this.adjacentTiles[this.directions.right] = this.state.map.getTileRight(i, x, y);
        // this.adjacentTiles[this.directions.up] = this.state.map.getTileAbove(i, x, y);
        // this.adjacentTiles[this.directions.down] = this.state.map.getTileBelow(i, x, y);

        this.directions[0] = this.state.map.getTile(x, y, this.state.wall_layer);
        this.directions[1] = this.state.map.getTileLeft(i, x, y);
        this.directions[2] = this.state.map.getTileRight(i, x, y);
        this.directions[3] = this.state.map.getTileAbove(i, x, y);
        this.directions[4] = this.state.map.getTileBelow(i, x, y);
    }

    getIntersection() {
        let intersection = [];

        // if (!this.adjacentTiles[this.directions.left].collides) {
        //     intersection.push(this.directions.left);
        // }

        // if (!this.adjacentTiles[this.directions.right].collides) {
        //     intersection.push(this.directions.right);
        // }

        // if (!this.adjacentTiles[this.directions.up].collides) {
        //     intersection.push(this.directions.up);
        // }

        // if (!this.adjacentTiles[this.directions.down].collides) {
        //     intersection.push(this.directions.down);
        // }

        return intersection;
    }

    update() {
        // Prevent returning home
        if (this.mode !== this.RETURNING_HOME) {
            this.state.physics.arcade.collide(this.sprite, this.state.home_layer);
        }

        var x = this.math.snapToFloor(Math.floor(this.sprite.x), this.gridSize) / this.gridSize;
        var y = this.math.snapToFloor(Math.floor(this.sprite.y), this.gridSize) / this.gridSize;

        if (this.sprite.x < 0) {
            this.sprite.x = this.state.map.widthInPixels - 2;
        }

        if (this.sprite.x >= this.state.map.widthInPixels - 1) {
            this.sprite.x = 1;
        }

        if (this.isAttacking && (this.mode === this.SCATTER || this.mode === this.CHASE)) {
            this.ghostDestination = this.getGhostDestination();
            this.mode = this.CHASE;
        }

        if (this.math.fuzzyEqual((x * this.gridSize) + (this.gridSize / 2), this.sprite.x, 6) &&
            this.math.fuzzyEqual((y * this.gridSize) + (this.gridSize / 2), this.sprite.y, 6)) {
                // Update Grid Sensors
                this.getAdjacentTiles(x, y);
            }

        // this.getAdjacentTiles();

        // if (this.turnDirection == this.directions.none) {
        //     let intersection = this.getIntersection();
        //     if (intersection.length > 0) {
        //         let randomDirection = Math.floor(Math.random() * intersection.length);
        //         let turndirection = intersection[randomDirection];

        //         this.checkDirection(turndirection);
        //     }
        // }
    }

    getGhostDestination() {
        switch (this.color) {
            case 'blue':
                return this.state.pacman.getPosition();
            case 'red':
                break;
            case 'orange':
                var pacmanPos = this.state.pacman.getPosition();
                var myPos = this.getPosition();
                if (myPos.distance(pacmanPos) > 8 * this.gridSize) {
                    return pacmanPos;
                }
                break;
            case 'pink':
                var dest = this.state.pacman.getPosition();
                var dir = this.state.pacman.getCurrentDirection();
                var offsetX = 0, offsetY = 0;

                if (dir === Phaser.LEFT || dir === Phaser.RIGHT) {
                    offsetX = (dir === Phaser.RIGHT) ? -4 : 4;
                }

                if (dir === Phaser.UP || dir === Phaser.DOWN) {
                    offsetY = (dir === Phaser.DOWN) ? -4 : 4;
                }

                offsetX *= this.gridSize;
                offsetY *= this.gridSize;
                dest.x -= offsetX;
                dest.y -= offsetY;

                if (dest.x < this.gridSize / 2) dest.x = this.gridSize / 2;
                if (dest.x > this.state.map.widthInPixels - this.gridSize / 2) dest.x = this.state.map.widthInPixels - this.gridSize / 2;
                if (dest.y < this.gridSize / 2) dest.y = this.gridSize / 2;
                if (dest.y > this.state.map.heightInPixels - this.gridSize / 2) dest.y = this.state.map.heightInPixels - this.gridSize / 2;
                return dest;
        }

        return new Phaser.Point(this.scatterDestination.x, this.scatterDestination.y);
    }

    getPosition() {
        var x = this.math.snapToFloor(Math.floor(this.sprite.x), this.gridSize) / this.gridSize;
        var y = this.math.snapToFloor(Math.floor(this.sprite.y), this.gridSize) / this.gridSize;
        return new Phaser.Point((x * this.gridSize) + (this.gridSize / 2), (y * this.gridSize) + (this.gridSize / 2));
    }

    // Private 
    private _resetVelocity = function(entity) {
        entity.body.velocity.x = 0;
        entity.body.velocity.y = 0;
    }
}