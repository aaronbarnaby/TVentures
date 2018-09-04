import * as _ from 'lodash';
import Pacman from "../components/Pacman";
import Ghost from "../components/Ghost";
import { Globals } from '../globals';

export default class BonusGameState extends Phaser.State {
    
    cursors: any = null;

    map: Phaser.Tilemap = null;
    gridSize = 32;

    map_layer: Phaser.TilemapLayer = null;
    wall_layer: Phaser.TilemapLayer = null;
    safe_layer: Phaser.TilemapLayer = null;
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
    ghostMovementInterval: any = null;    

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

    create() {
        // Map
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman', 'pacman_tiles');

        this.map_layer = this.map.createLayer('map');
        this.wall_layer = this.map.createLayer('walls');
        this.safe_layer = this.map.createLayer('safe');
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

        // Pacman
        this.pacman = new Pacman(this);

        // Score Text
        this.scoreText = this.add.text(35, 22, `Score: ${this.score}`, { fill: '#FFFFFF' });

        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;

        // Ghosts
        this.ghosts.push(new Ghost(this, 'blue', { x: 12,  y: 8 }, Phaser.LEFT));
        this.ghosts.push(new Ghost(this, 'red', { x: 11,  y: 8 }, Phaser.RIGHT));
        this.ghosts.push(new Ghost(this, 'orange', { x: 12,  y: 8 }, Phaser.RIGHT));
        this.ghosts.push(new Ghost(this, 'pink', { x: 13,  y: 8 }, Phaser.LEFT));

        this.ghostGroup = this.add.physicsGroup();
        _.forEach(this.ghosts, (ghost) => {
            this.ghostGroup.add(ghost.sprite);
        });

        if (Globals.hasSound) {
            this.game.sound.play('pacman_beginning');
        }

        this.time.events.add(4000, () => {
            this.sendExitOrder(this.ghosts[0]);
        }, this);
    }

    update() {
        this.scoreText.text = `Score: ${this.score}`;

        if (!this.pacman.isDead) {
            _.forEach(this.ghosts, (ghost) => {
                if (ghost.mode !== ghost.RETURNING_HOME) {
                    this.physics.arcade.overlap(this.pacman.sprite, ghost.sprite, this.eatGhost, null, this);
                }
            });

            if (this.changeModeTimer !== -1 && !this.isFrightened && this.changeModeTimer < this.time.time) {
                this.currentMode++;
                if (this.TIME_MODES[this.currentMode].time == -1) {
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

                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
            }
        }

        this.pacman.update();
        this.updateGhosts();

        //this.checkKeys();

        // if (this.dots.countLiving() > 0) {
        //     this.pacman.update();
        //     _.forEach(this.ghosts, (ghost) => {
        //         ghost.update();
        //     });
        // } else {
        //     // TODO: Better Complete Screen
        //     this.add.text(300, 150, "Congratulations !", {fill: 'white', backgroundColor: 'black'});
        //     this.add.text(230, 180, "Refresh to restart the game.", {fill: 'white', backgroundColor: 'black'});
        // }
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

    // runSound: Phaser.Sound = null;
    // ghostScatter() {
    //     _.forEach(this.ghosts, (ghost) => {
    //         ghost.setAfraid();
    //     });

    //     this.runSound = this.game.sound.play('pacman_ghostrun', 1, true);
    // }

    // ghostNormal() {
    //     _.forEach(this.ghosts, (ghost) => {
    //         ghost.setNormal();
    //     });

    //     this.runSound.stop();
    // }

    eatGhost(pacman, ghost) {
        if (this.isFrightened) {
            ghost.kill(); // Replace with Below
            // Return Target Ghost to Home
            // this[ghost.name].mode = this[ghost.name].RETURNING_HOME;
            // this[ghost.name].ghostDestination = new Phaser.Point(12 * this.gridSize, 8 * this.gridSize);
            // this[ghost.name].resetSafeTiles();
            // this.score += 10;
        } else {
            this.killPacman();
        }
    }

    killPacman() {
        this.pacman.isDead = true;
        this.stopGhosts();
    }

    updateGhosts() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.update();
        });
    }

    stopGhosts() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.mode = ghost.STOP;
        });
    }
}