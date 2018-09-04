import * as _ from 'lodash';
import Pacman from "../components/Pacman";
import Ghost from "../components/Ghost";
import { Globals } from '../globals';

export default class BonusGameState extends Phaser.State {
    
    DEBUG_MODE: boolean = false;

    map: Phaser.Tilemap = null;
    gridSize = 32;

    map_layer: Phaser.TilemapLayer = null;
    dots_layer: Phaser.TilemapLayer = null;
    pills_layer: Phaser.TilemapLayer = null;

    safeTile = 1;

    dots: Phaser.Group = null
    numDots: number = 0;
    totalDots: number = 0;
    pills: Phaser.Group = null;
    numPills: number = 0;
    cherry: any = null;
    isCherryActive: boolean = false;

    score: number = 0;
    scoreText: Phaser.Text = null;
    values = {
        dot: 1,
        pill: 5,
        ghost: 400,
        cherry: 2000
    };

    pacman: Pacman = null;

    ghosts: Ghost[] = [];
    ghostGroup: Phaser.Group = null;
    blueGhost: Ghost = null;
    redGhost: Ghost = null;
    orangeGhost: Ghost = null;
    pinkGhost: Ghost = null;
    isOrangeGhostOut: boolean = false;
    isRedGhostOut: boolean = false;

    ghostMovementInterval: any = null;    

    runSound: Phaser.Sound = null;

    TIME_MODES: any = [
        { mode: "scatter", time: 7000 },
        { mode: "chase", time: 20000 },
        { mode: "scatter", time: 7000 },
        { mode: "chase", time: 20000 },
        { mode: "scatter", time: 5000 },
        { mode: "chase", time: 20000 },
        { mode: "scatter", time: 5000 },
        { mode: "chase", time: -1 }
    ];

    changeModeTimer: number = 0;
    remainingTime: number = 0;
    currentMode: number = 0;

    isFrightened = false;
    FRIGHTENED_MODE_TIME = 7000;

    cursors: any = null;
    lastKeyPressed: number = 0;
    KEY_COOLING_DOWN_TIME: number = 250;
    
    create() {
        // Map
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman', 'pacman_tiles');

        this.map_layer = this.map.createLayer('map');
        this.dots_layer = this.map.createLayer('dots');
        this.pills_layer = this.map.createLayer('pills');

        // Dots
        this.dots = this.add.physicsGroup();
        this.numDots = this.map.createFromTiles(14, this.safeTile, 'dot', this.dots_layer, this.dots);
        this.totalDots = this.numDots;

        // Center Dots
        this.dots.setAll('x', 12, false, false, 1);
        this.dots.setAll('y', 12, false, false, 1);

        // Pills
        this.pills = this.add.physicsGroup();
        this.numPills = this.map.createFromTiles(15, this.safeTile, 'pill', this.pills_layer, this.pills);

        // Center Pills
        this.pills.setAll('x', 9, false, false, 1);
        this.pills.setAll('y', 7, false, false, 1);

        this.map.setCollisionByExclusion([this.safeTile], true, this.map_layer);

        this.cursors = this.input.keyboard.createCursorKeys();

        // WSAD
        this.cursors["w"] = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.cursors["s"] = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.cursors["a"] = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.cursors["d"] = this.input.keyboard.addKey(Phaser.Keyboard.D);

        // Debug Key
        this.cursors["t"] = this.input.keyboard.addKey(Phaser.Keyboard.T);

        // Pacman
        this.pacman = new Pacman(this, 'pacman_walk', { x: 12, y: 16 });

        // Score Text
        this.scoreText = this.add.text(35, 22, `Score: ${this.score}`, { fill: '#FFFFFF' });

        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;

        // Ghosts
        this.blueGhost = new Ghost(this, 'blue', { x: 12,  y: 6 }, Phaser.RIGHT);
        this.redGhost = new Ghost(this, 'red', { x: 11,  y: 8 }, Phaser.RIGHT);
        this.orangeGhost = new Ghost(this, 'orange', { x: 12,  y: 8 }, Phaser.RIGHT);
        this.pinkGhost = new Ghost(this, 'pink', { x: 13,  y: 8 }, Phaser.LEFT);
        this.ghosts.push(this.blueGhost, this.redGhost, this.orangeGhost, this.pinkGhost);

        this.ghostGroup = this.add.physicsGroup();
        _.forEach(this.ghosts, (ghost) => {
            this.ghostGroup.add(ghost.sprite);
        });

        if (Globals.hasSound) {
            //this.game.sound.play('pacman_beginning'); // Temp Disabled
        }

        this.sendExitOrder(this.pinkGhost);
    }

    checkKeys() {
        this.pacman.checkKeys(this.cursors);

        if (this.lastKeyPressed < this.time.time) {
            if (this.cursors.t.isDown) {
                // Debug Mode
                this.DEBUG_MODE = !this.DEBUG_MODE;
                this.lastKeyPressed = this.time.time + this.KEY_COOLING_DOWN_TIME;
            }
        }
    }

    eatGhost(pacman, ghost) {
        if (this.isFrightened) {
            this[ghost.name].mode = this[ghost.name].RETURNING_HOME;
            this[ghost.name].ghostDestination = new Phaser.Point(12 * this.gridSize, 8 * this.gridSize);
            this[ghost.name].resetSafeTiles();
            this.score += this.values.ghost;
        } else {
            this.killPacman();
        }
    }

    getCurrentMode() {
        if (!this.isFrightened) {
            if (this.TIME_MODES[this.currentMode].mode === "scatter") {
                return "scatter";
            } else {
                return "chase";
            }
        } else {
            return "random";
        }
    }

    gimeMeExitOrder(ghost) {
        this.game.time.events.add(Math.random() * 3000, this.sendExitOrder, this, ghost);
    }

    killPacman() {
        this.sound.play('pacman_death');
        this.pacman.isDead = true;
        this.stopGhosts();
    }

    stopGhosts() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.mode = ghost.STOP;
        });
    }

    update() {
        this.scoreText.text = `Score: ${this.score}`;

        if (!this.pacman.isDead) {
            _.forEach(this.ghosts, (ghost) => {
                if (ghost.mode !== ghost.RETURNING_HOME) {
                    this.physics.arcade.collide(this.pacman.sprite, ghost.sprite, this.eatGhost, null, this);
                }
            });

            if (this.totalDots - this.numDots > 30 && !this.isOrangeGhostOut) {
                this.isOrangeGhostOut = true;
                this.sendExitOrder(this.orangeGhost);
            }

            if (this.numDots < this.totalDots / 3 && !this.isRedGhostOut) {
                this.isRedGhostOut = true;
                this.sendExitOrder(this.redGhost);
            }

            if (this.changeModeTimer !== -1 && !this.isFrightened && this.changeModeTimer < this.time.time) {
                this.currentMode++;
                if (this.TIME_MODES[this.currentMode] == null || this.TIME_MODES[this.currentMode].time == -1) {
                    this.changeModeTimer = -1;
                } else {
                    this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
                }

                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
            }

            if (this.isFrightened && this.changeModeTimer < this.time.time) {
                this.changeModeTimer = this.time.time + this.remainingTime;
                this.isFrightened = false;
                this.runSound.stop();

                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
            }
        }

        this.pacman.update();
        this.updateGhosts();

        this.checkKeys();
    }

    enterFrightenedMode() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.enterFrightenedMode();
        });

        if (!this.isFrightened) {
            this.remainingTime = this.changeModeTimer - this.time.time;
        }
        this.changeModeTimer = this.time.time + this.FRIGHTENED_MODE_TIME;
        this.isFrightened = true;

        this.runSound = this.game.sound.play('pacman_ghostrun', 1, true);
    }

    updateGhosts() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.update();
        });
    }

    sendExitOrder(ghost) {
        ghost.mode = ghost.EXIT_HOME;
    }

    sendAttackOrder() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.attack();
        });
    }

    sendScatterOrder() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.scatter();
        });
    }
}