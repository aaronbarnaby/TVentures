import BonusGameState from "../states/bonus-game";
import { Globals } from "../globals";

export default class Pacman {

    // Refs
    state: BonusGameState;
    math: any;

    gridSize: number = null;
    safeTile: number = null;
    
    name: string = 'pacman';
    key: string = null;

    speed = 100;
    isDead = false;
    isAnimatingDeath = false;

    startPos: any = null;
    marker = new Phaser.Point();
    turnPoint = new Phaser.Point();

    directions = [ null, null, null, null, null ];
    opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    current = Phaser.NONE;
    turning = Phaser.NONE;
    want2go = Phaser.NONE;

    keyPressTimer = 0;
    KEY_COOLING_DOWN_TIME = 750;

    sprite: Phaser.Sprite = null;

    constructor(state: BonusGameState, key: string, startPos: any) {
        this.state = state;
        this.math = state.game.math;
       
        this.gridSize = state.gridSize;
        this.safeTile = state.safeTile;

        this.startPos = startPos;

        this.sprite = state.add.sprite((startPos.x * this.gridSize) + (this.gridSize / 2), (startPos.y * this.gridSize) + (this.gridSize / 2), key, 0);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(0.95);

        this.sprite.animations.add('munch', null, 6, true);

        state.physics.arcade.enable(this.sprite);

        this.sprite.play('munch');
    }

    move(direction) {
        if (direction === Phaser.NONE) {
            this.sprite.body.velocity.x = this.sprite.body.velocity.y = 0;
            return;
        }

        var speed = this.speed;
        if (direction === Phaser.LEFT || direction === Phaser.UP) {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
            this.sprite.body.velocity.x = speed;
        } else {
            this.sprite.body.velocity.y = speed;
        }

        this.sprite.scale.x = 1;
        this.sprite.angle = 0;

        if (direction === Phaser.LEFT) {
            this.sprite.scale.x = -1;
        } else if (direction === Phaser.UP) {
            this.sprite.angle = 270;
        } else if (direction === Phaser.DOWN) {
            this.sprite.angle = 90;
        }

        this.current = direction;
    }

    update() {
        if (!this.isDead) {
            this.state.physics.arcade.collide(this.sprite, this.state.map_layer);
            this.state.physics.arcade.overlap(this.sprite, this.state.dots, this.eatDot, null, this);
            this.state.physics.arcade.overlap(this.sprite, this.state.pills, this.eatPill, null, this);

            this.marker.x = this.math.snapToFloor(Math.floor(this.sprite.x), this.gridSize) / this.gridSize;
            this.marker.y = this.math.snapToFloor(Math.floor(this.sprite.y), this.gridSize) / this.gridSize;

            if (this.marker.x < 0) {
                this.sprite.x = this.state.map.widthInPixels - 1;
            }

            if (this.marker.x >= this.state.map.width) {
                this.sprite.x = 1;
            }

            // Grid Sensors
            this.directions[1] = this.state.map.getTileLeft(this.state.map_layer.index, this.marker.x, this.marker.y);
            this.directions[2] = this.state.map.getTileRight(this.state.map_layer.index, this.marker.x, this.marker.y);
            this.directions[3] = this.state.map.getTileAbove(this.state.map_layer.index, this.marker.x, this.marker.y);
            this.directions[4] = this.state.map.getTileBelow(this.state.map_layer.index, this.marker.x, this.marker.y);

            if (this.turning !== Phaser.NONE) {
                this.turn();
            }
        } else {
            this.move(Phaser.NONE);
            if (!this.isAnimatingDeath) {
                // this.sprite.play('death');
                this.isAnimatingDeath = true;
            }
        }
    }

    checkKeys(cursors) {
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown || cursors.w.isDown || cursors.s.isDown || cursors.a.isDown || cursors.d.isDown) {
            this.keyPressTimer = this.state.time.time + this.KEY_COOLING_DOWN_TIME;
        }

        if ((cursors.left.isDown || cursors.a.isDown) && this.current !== Phaser.LEFT) {
            this.want2go = Phaser.LEFT;
        } else if ((cursors.right.isDown || cursors.d.isDown) && this.current !== Phaser.RIGHT) {
            this.want2go = Phaser.RIGHT;
        } else if ((cursors.up.isDown || cursors.w.isDown) && this.current !== Phaser.UP) {
            this.want2go = Phaser.UP;
        } else if ((cursors.down.isDown || cursors.s.isDown) && this.current !== Phaser.DOWN) {
            this.want2go = Phaser.DOWN;
        }

        if (this.state.time.time > this.keyPressTimer) {
            this.turning = Phaser.NONE;
            this.want2go = Phaser.NONE;
        } else {
            this.checkDirection(this.want2go);
        }
    }

    eatDot(pacman: Pacman, dot: Phaser.Group) {
        if (Globals.hasSound) {
            this.state.sound.play('pacman_eatpill');
        }

        dot.kill();

        this.state.score += this.state.values.dot;
        this.state.numDots --;

        if (this.state.dots.countLiving() === 0) {
            // TODO: LEVEL Completed

            this.state.dots.callAll('revive', this); // Respawn Dots
        }
    }

    eatPill(pacman: Pacman, pill: Phaser.Group) {
        if (Globals.hasSound) {
            this.state.sound.play('pacman_eatpill');
        }

        pill.kill();

        this.state.score += this.state.values.pill;
        this.state.numPills --;

        this.state.enterFrightenedMode();
    }

    turn() {
        var cx = Math.floor(this.sprite.x);
        var cy = Math.floor(this.sprite.y);

        if (!this.math.fuzzyEqual(cx, this.turnPoint.x, 6) || !this.math.fuzzyEqual(cy, this.turnPoint.y, 6)) {
            return false;
        }

        this.sprite.x = this.turnPoint.x;
        this.sprite.y = this.turnPoint.y;

        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);
        this.move(this.turning);
        this.turning = Phaser.NONE;

        return true;
    }

    checkDirection(direction) {
        if (this.turning == direction || this.directions[direction] == null || this.directions[direction].collides) {
            return;
        }

        if (this.current === this.opposites[direction]) {
            this.move(direction);
            this.keyPressTimer = this.state.time.time;
        } else {
            this.turning = direction;

            this.turnPoint.x = (this.marker.x * this.gridSize) + (this.gridSize / 2);
            this.turnPoint.y = (this.marker.y * this.gridSize) + (this.gridSize / 2);
            this.want2go = Phaser.NONE;
        }

        // this.turning = direction;
        // this.turnPoint.x = (this.marker.x * 32) + (32 / 2);
        // this.turnPoint.y = (this.marker.y * 32) + (32 / 2);

        // var math: any = this.state.game.math;
        // if (math.fuzzyEqual(this.sprite.x, this.turnPoint.x, 6) || math.fuzzyEqual(this.sprite.y, this.turnPoint.y, 6)) {
        //     this.turnDirection = direction;
        //     this.sprite.x = this.turnPoint.x;
        //     this.sprite.y = this.turnPoint.y;

        //     this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);

        //     this.move(this.turning);
        //     this.turning = this.directions.none;
        // }
    }

    getPosition() {
        return new Phaser.Point((this.marker.x * this.gridSize) + (this.gridSize / 2), (this.marker.y * this.gridSize) + (this.gridSize / 2));
    }

    getCurrentDirection() {
        return this.current;
    }
}