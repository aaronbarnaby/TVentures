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

        //this.map.setCollision(1, true, this.wall_layer);
        this.map.setCollisionByExclusion([this.safeTile], true, this.map_layer);

        this.cursors = this.input.keyboard.createCursorKeys();

        // Pacman
        this.pacman = new Pacman(this);

        // Ghosts
        this.ghosts.push(new Ghost(this, 'blue', { x: 12,  y: 8 }, Phaser.LEFT));
        this.ghosts.push(new Ghost(this, 'red', { x: 11,  y: 8 }, Phaser.RIGHT));
        this.ghosts.push(new Ghost(this, 'orange', { x: 12,  y: 8 }, Phaser.RIGHT));
        this.ghosts.push(new Ghost(this, 'pink', { x: 13,  y: 8 }, Phaser.LEFT));

        this.ghostGroup = this.add.physicsGroup();
        _.forEach(this.ghosts, (ghost) => {
            this.ghostGroup.add(ghost.sprite);
        });

        this.scoreText = this.add.text(35, 22, `Score: ${this.score}`, { fill: '#FFFFFF' });

        if (Globals.hasSound) {
            this.game.sound.play('pacman_beginning');
        }
    }

    runSound: Phaser.Sound = null;
    ghostScatter() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.setAfraid();
        });

        this.runSound = this.game.sound.play('pacman_ghostrun', 1, true);
    }

    ghostNormal() {
        _.forEach(this.ghosts, (ghost) => {
            ghost.setNormal();
        });

        this.runSound.stop();
    }

    dead(pacman: Phaser.Sprite, ghost: Ghost) {
        pacman.kill();

        // TODO: Death Animation and better death screen + lives?
        this.add.text(140, 300, "You died! Good luck next time...", {fill: 'white', backgroundColor: 'black'});
        this.add.text(150, 330, "Refresh to restart the game.", {fill: 'white', backgroundColor: 'black'});
    }

    stopGhost(ghost: Phaser.Sprite, wall: any) {
        _.forEach(this.ghosts, (i) => {
            if (i.sprite == ghost) {
                //i.turnDirection = "NONE";
                i.currentDir = Phaser.NONE;
            }
        });
    }

    updateScore() {
        this.scoreText.setText(`Score: ${this.score}`);
    }

    update() {
        if (this.dots.countLiving() > 0) {
            //this.physics.arcade.collide(this.ghostGroup, this.wall_layer, this.stopGhost, null, this);
            //this.physics.arcade.collide(this.pacman.sprite, this.ghostGroup, this.dead, null, this);
            
            this.pacman.update();
            _.forEach(this.ghosts, (ghost) => {
                ghost.update();
            });
        } else {
            // TODO: Better Complete Screen
            this.add.text(300, 150, "Congratulations !", {fill: 'white', backgroundColor: 'black'});
            this.add.text(230, 180, "Refresh to restart the game.", {fill: 'white', backgroundColor: 'black'});
        }
    }
}