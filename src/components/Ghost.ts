import BonusGameState from "../states/bonus-game";

export default class Ghost {
    
    // Refs
    state: BonusGameState;
    math: any;
    gridSize: any;

    safeTiles: number[] = null;
    
    // Vars
    name: string;
    color: string;
    
    sprite: Phaser.Sprite;
    
    speed = 75;
    scatterSpeed = 90;
    frightenedSpeed = 50;
    ghostDeadSpeed = 50;
    
    startDir: number = null;
    startPos: any = null;
    lastPos: any = null;
    
    directions = [ null, null, null, null, null ];
    opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];
    currentDir: number = Phaser.NONE;
    turnPoint: any = {};
    
    scatterDestination: Phaser.Point;
    ghostDestination: Phaser.Point;
    
    flag: boolean = null;
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

        this.safeTiles = [this.state.safeTile, 19, 20];
        
        this.name = `ghost_${name}`;
        this.color = name;

        this.startPos = startPos;
        this.lastPos = startPos;

        this.startDir = startDir;
        this.currentDir = startDir;        
        
        switch (name) {
            case 'blue':
            // Bottom-Right
            this.scatterDestination = new Phaser.Point(22 * this.gridSize, 17 * this.gridSize);
            this.safeTiles = [this.state.safeTile];
            this.mode = this.SCATTER;
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
        this.sprite.name = `${name}Ghost`;
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(0.85);

        state.physics.arcade.enable(this.sprite);
    }
    
    // Public
  
    update() {
        // Prevent returning home
        if (this.mode !== this.RETURNING_HOME) {
            this.state.physics.arcade.collide(this.sprite, this.state.map_layer);
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
            this.directions[0] = this.state.map.getTile(x, y, this.state.map_layer);
            this.directions[1] = this.state.map.getTileLeft(this.state.map_layer.index, x, y);
            this.directions[2] = this.state.map.getTileRight(this.state.map_layer.index, x, y);
            this.directions[3] = this.state.map.getTileAbove(this.state.map_layer.index, x, y);
            this.directions[4] = this.state.map.getTileBelow(this.state.map_layer.index, x, y);
            
            var canContinue = (this.directions[this.currentDir] != null) ? this.checkSafeTile(this.directions[this.currentDir].index) : false;
            var possibleExits = [];
            for (var q = 1; q < this.directions.length; q++) {
                if ((this.directions[q] != null && this.checkSafeTile(this.directions[q].index)) && q !== this.opposites[this.currentDir]) {
                    possibleExits.push(q);
                }
            }
            
            switch (this.mode) {
                case this.RANDOM:
                    if (this.turnTimer < this.state.time.time && (possibleExits.length > 1 || !canContinue)) {
                        var select = Math.floor(Math.random() & possibleExits.length);
                        var newDirection = possibleExits[select];
                        
                        this.turnPoint.x = (x * this.gridSize) + (this.gridSize / 2);
                        this.turnPoint.y = (y * this.gridSize) + (this.gridSize / 2);
                        
                        this.sprite.x = this.turnPoint.x;
                        this.sprite.y = this.turnPoint.y;
                        
                        this.lastPos = { x: x, y: y };
                        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);
                        this.move(newDirection);
                        
                        this.turnTimer = this.state.time.time + this.TURNING_COOLDOWN;
                    }
                    break;
                case this.RETURNING_HOME:
                    if (this.turnTimer < this.state.time.time) {
                        this.sprite.body.reset(this.sprite.x, this.sprite.y);
                        
                        if (this.flag = this.flag ? false : true) {
                            this.sprite.body.velocity.x = 0;
                            if (this.sprite.y < 8 * this.gridSize) {
                                this.sprite.body.velocity.y = this.ghostDeadSpeed;
                                // this.sprite.animations.play("23"); // Eyes Down
                            }

                            if (this.sprite.y > 9 * this.gridSize) {
                                this.sprite.body.velocity.y = -this.ghostDeadSpeed;
                                // this.sprite.animations.play("22") // Eyes Up
                            }
                        } else {
                            this.sprite.body.velocity.y = 0;
                            if (this.sprite.x < 12 * this.gridSize) {
                                this.sprite.body.velocity.x = this.ghostDeadSpeed;
                                //this.sprite.animations.play("20"); // Eyes Right
                            }
                            if (this.sprite.x > 13 * this.gridSize) {
                                this.sprite.body.velocity.x = -this.ghostDeadSpeed;
                                //this.sprite.animations.play("21"); // Eyes Left
                            }
                        }
                        this.turnTimer = this.state.time.time + this.RETURNING_COOLDOWN;
                    }
                    if (this.hasReachedHome()) {
                        this.turnPoint.x = (x * this.gridSize) + (this.gridSize / 2);
                        this.turnPoint.y = (y * this.gridSize) + (this.gridSize / 2);
                        this.sprite.x = this.turnPoint.x;
                        this.sprite.y = this.turnPoint.y;
                        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);
                        this.mode = this.AT_HOME;
                        this.state.gimeMeExitOrder(this);
                    }
                    break;
                case this.CHASE:
                    if (this.turnTimer < this.state.time.time) {
                        var distanceToObj = 999999;
                        var direction, decision, bestDecision;
                        for (var q = 0; q < possibleExits.length; q++) {
                            direction = possibleExits[q];

                            switch (direction) {
                                case Phaser.LEFT:
                                    decision = new Phaser.Point((x - 1) * this.gridSize + (this.gridSize / 2), (y * this.gridSize) + (this.gridSize / 2));
                                    break;
                                case Phaser.RIGHT:
                                    decision = new Phaser.Point((x + 1) * this.gridSize + (this.gridSize / 2), (y * this.gridSize) + (this.gridSize / 2));
                                    break;
                                case Phaser.UP:
                                    decision = new Phaser.Point(x * this.gridSize + (this.gridSize / 2), ((y - 1) * this.gridSize) + (this.gridSize / 2));
                                    break;
                                case Phaser.DOWN:
                                    decision = new Phaser.Point(x * this.gridSize + (this.gridSize / 2),  ((y + 1) * this.gridSize) + (this.gridSize / 2));
                                    break;
                                default:
                                    break;
                            }

                            var dist = this.ghostDestination.distance(decision);
                            if (dist < distanceToObj) {
                                bestDecision = direction;
                                distanceToObj = dist;
                            }
                        }

                        // if (this.state.isSpecialTile({ x: x, y: y }) && bestDecision === Phaser.UP) {
                        //     bestDecision = this.currentDir;
                        // }

                        this.turnPoint.x = (x * this.gridSize) + (this.gridSize / 2);
                        this.turnPoint.y = (y * this.gridSize) + (this.gridSize / 2);

                        this.sprite.x = this.turnPoint.x;
                        this.sprite.y = this.turnPoint.y;

                        this.lastPos = { x: x, y: y };

                        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);
                        this.move(bestDecision);

                        this.turnTimer = this.state.time.time + this.TURNING_COOLDOWN;
                    }
                    break;
                case this.AT_HOME:
                    if (!canContinue) {
                        this.turnPoint.x = (x * this.gridSize) + (this.gridSize / 2);
                        this.turnPoint.y = (8 * this.gridSize) + (this.gridSize / 2);
                        this.sprite.x = this.turnPoint.x;
                        this.sprite.y = this.turnPoint.y;
                        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);
                        var dir = (this.currentDir === Phaser.LEFT) ? Phaser.RIGHT : Phaser.LEFT;
                        this.move(dir);
                    } else {
                        this.move(this.currentDir);
                    }
                    break;
                case this.EXIT_HOME:
                    if (this.currentDir !== Phaser.UP && x == 12) {
                        this.turnPoint.x = (12 * this.gridSize) + (this.gridSize / 2);
                        this.turnPoint.y = (y * this.gridSize) + (this.gridSize / 2);
                        this.sprite.x = this.turnPoint.x;
                        this.sprite.y = this.turnPoint.y;
                        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);                        
                        this.move(Phaser.UP);
                    } else if (this.currentDir === Phaser.UP && y == 6) {
                        this.turnPoint.x = (x * this.gridSize) + (this.gridSize / 2);
                        this.turnPoint.y = (y * this.gridSize) + (this.gridSize / 2);
                        this.sprite.x = this.turnPoint.x;
                        this.sprite.y = this.turnPoint.y;
                        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);  
                        this.mode = this.state.getCurrentMode();
                        return;
                    } else if (!canContinue) {
                        this.turnPoint.x = (x * this.gridSize) + (this.gridSize / 2);
                        this.turnPoint.y = (y * this.gridSize) + (this.gridSize / 2);
                        this.sprite.x = this.turnPoint.x;
                        this.sprite.y = this.turnPoint.y;
                        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);
                        var dir = (this.currentDir === Phaser.LEFT) ? Phaser.RIGHT : Phaser.LEFT;
                        this.move(dir);
                    } else {
                        this.move(this.currentDir);
                    }
                    break;
                case this.SCATTER:
                    this.ghostDestination = new Phaser.Point(this.scatterDestination.x, this.scatterDestination.y);
                    this.mode = this.CHASE;
                    break;
                case this.STOP:
                    this.move(Phaser.NONE);
                    break;
            }
        }
    }

    move(dir) {
        this.currentDir = dir;

        var speed = this.speed;
        if (this.state.getCurrentMode() === this.SCATTER) {
            speed = this.scatterSpeed;
        }

        if (this.mode === this.RANDOM) {
            speed = this.frightenedSpeed;
        } else if (this.mode === this.RETURNING_HOME) {
            speed = this.ghostDeadSpeed;
            // this.sprite.animations.play((dir+20).toString()); // Eyes
        } else {
            // this.sprite.animations.play(dir.toString());
        }

        if (this.currentDir === Phaser.NONE) {
            this.sprite.body.velocity.x = this.sprite.body.velocity.y = 0;
            return;
        }

        if (dir === Phaser.LEFT || dir === Phaser.UP) {
            speed = -speed;
        }

        if (dir === Phaser.LEFT || dir === Phaser.RIGHT) {
            this.sprite.body.velocity.x = speed;
        } else {
            this.sprite.body.velocity.y = speed;
        }
    }

    attack() {
        if (this.mode !== this.RETURNING_HOME) {
            this.isAttacking = true;
            //this.sprite.animations.play(this.currentDir.toString());
            if (this.mode !== this.AT_HOME && this.mode != this.EXIT_HOME) {
                this.currentDir = this.opposites[this.currentDir];
            }
        }
    }

    scatter() {
        if (this.mode !== this.RETURNING_HOME) {
            //this.sprite.animations.play(this.currentDir.toString());
            this.isAttacking = false;
            if (this.mode !== this.AT_HOME && this.mode != this.EXIT_HOME) {
                this.mode = this.SCATTER;
            }
        }
    }

    enterFrightenedMode() {
        if (this.mode !== this.AT_HOME && this.mode !== this.EXIT_HOME && this.mode !== this.RETURNING_HOME) {
            // this.sprite.play("frightened");
            this.mode = this.RANDOM;
            this.isAttacking = false;
        }
    }
    
    checkSafeTile(tileIndex) {
        for (var q = 0; q < this.safeTiles.length; q++) {
            if (this.safeTiles[q] == tileIndex) {
                return true;
            }
        }
        return false;
    }

    resetSafeTiles() {
        this.safeTiles = [this.state.safeTile, 19, 20];
    }
    
    getGhostDestination() {
        switch (this.color) {
            case 'blue':
                return this.state.pacman.getPosition();
            case 'red':
                var pacmanPos = this.state.pacman.getPosition();
                var blueGhostPos = this.state.blueGhost.getPosition();
                var diff = Phaser.Point.subtract(pacmanPos, blueGhostPos);
                var dest: any = Phaser.Point.add(pacmanPos, diff);
                if (dest.x < this.gridSize / 2) dest.x = this.gridSize / 2;
                if (dest.x > this.state.map.widthInPixels - this.gridSize / 2) dest.x = this.state.map.widthInPixels - this.gridSize / 2;
                if (dest.y < this.gridSize / 2) dest.y = this.gridSize / 2;
                if (dest.y > this.state.map.heightInPixels - this.gridSize / 2) dest.y = this.state.map.heightInPixels - this.gridSize / 2;
                return dest;
                break;
            case 'orange':
                var pacmanPos = this.state.pacman.getPosition();
                var myPos = this.getPosition();
                if (myPos.distance(pacmanPos) > 8 * this.gridSize) {
                    return pacmanPos;
                } else {
                    return new Phaser.Point(this.scatterDestination.x, this.scatterDestination.y);
                }
                break;
            case 'pink':
                var dest: any = this.state.pacman.getPosition();
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

    hasReachedHome() {
        if (this.sprite.x < 11 * this.gridSize || this.sprite.x > 13 * this.gridSize || 
            this.sprite.y < 8 * this.gridSize || this.sprite.y > 9 * this.gridSize) {
            return false;
        }
        return true;
    }
    
    getPosition() {
        var x = this.math.snapToFloor(Math.floor(this.sprite.x), this.gridSize) / this.gridSize;
        var y = this.math.snapToFloor(Math.floor(this.sprite.y), this.gridSize) / this.gridSize;
        return new Phaser.Point((x * this.gridSize) + (this.gridSize / 2), (y * this.gridSize) + (this.gridSize / 2));
    }
}