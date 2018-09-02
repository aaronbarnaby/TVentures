import Pacman from '../Entities/Pacman';
import Ghost from '../Entities/Ghost';


export default {
      eatPill: function(pacman, dot) {
            this.pacman.eatPill(this.scoreText);
            dot.kill();
      },
      dead: function(pacman, ghost) {
            pacman.kill();
            this.add.text(140, 300, "You died! Good luck next time...", {fill: 'white', backgroundColor: 'black'});
            this.add.text(150, 330, "Refresh to restart the game.", {fill: 'white', backgroundColor: 'black'});
      },
      stopGhost: function(ghost, wall) {
            if (this.ghost_blue.sprite == ghost) {
                  this.ghost_blue.turnDirection = "NONE";
            } else if (this.ghost_red.sprite == ghost) {
                  this.ghost_red.turnDirection = "NONE";
            } else if (this.ghost_orange.sprite == ghost) {
                  this.ghost_orange.turnDirection = "NONE";
            } else if (this.ghost_pink.sprite == ghost) {
                  this.ghost_pink.turnDirection = "NONE";
            }
      },
      preload: function() {
            // Map
            this.load.tilemap('map', 'assets/maps/map_pacman.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('tile', 'assets/maps/tile.png');
            this.load.image('safetile', 'assets/maps/safetile.png');

            // Items
            this.load.image('pill', 'assets/sprites/pills/spr_pill_0.png');
            this.load.image('powerpill', 'assets/sprites/pills/spr_power_pill_0.png');
            this.load.image('cherry', 'assets/sprites/cherry/spr_cherry_0.png');

            // Pacman
            this.pacman = new Pacman();
            this.pacman.preload(this);
            this.load.image('pacman_life_counter', 'assets/sprites/pacman/spr_lifecounter_0.png');

            // Ghosts
            this.ghost_blue = new Ghost('blue', {x: 300, y: 240});
            this.ghost_blue.preload(this);

            this.ghost_red = new Ghost('red', {x: 340, y: 240});
            this.ghost_red.preload(this);

            this.ghost_orange = new Ghost('orange', {x: 300, y: 280});
            this.ghost_orange.preload(this);

            this.ghost_pink = new Ghost('pink', {x: 340, y: 280});
            this.ghost_pink.preload(this);
	},
      create: function() {
            this.map = this.add.tilemap('map');
            this.map.addTilesetImage('tile', 'tile');
            this.map.addTilesetImage('safetile', 'safetile');
            this.wall_layer = this.map.createLayer('walls');
            this.pill_layer = this.map.createLayer('pills');

            //Make pills sprites
            this.pills = this.add.physicsGroup();
            this.map.createFromTiles(2, null, 'pill', this.pill_layer, this.pills);
            //Center pills
            this.pills.setAll('x', 12, false, false, 1);
            this.pills.setAll('y', 12, false, false, 1);

            this.map.setCollision(1, true, this.wall_layer);

            this.cursors = this.input.keyboard.createCursorKeys();

            this.pacman.create(this);
            this.ghost_blue.create(this);
            this.ghost_red.create(this);
            this.ghost_orange.create(this);
            this.ghost_pink.create(this);

            var thisState = this;

            this.ghostMovementInterval = setInterval(function() {
                  thisState.ghost_blue.turnDirection = "NONE";
                  thisState.ghost_red.turnDirection = "NONE";
                  thisState.ghost_orange.turnDirection = "NONE";
                  thisState.ghost_pink.turnDirection = "NONE";
            }, 5000);

            this.ghosts = this.add.physicsGroup();
            this.ghosts.add(this.ghost_blue.sprite);
            this.ghosts.add(this.ghost_red.sprite);
            this.ghosts.add(this.ghost_orange.sprite);
            this.ghosts.add(this.ghost_pink.sprite);

            // Texts
            this.scoreText = this.add.text(5, 0, 'Score: ' + this.pacman.score);
	},
	update: function() {
            if (this.pills.countLiving() > 0) {
                  // Collision Handling
                  this.physics.arcade.collide(this.pacman.sprite, this.wall_layer);
                  this.physics.arcade.collide(this.ghosts, this.wall_layer, this.stopGhost, null, this);
                  this.physics.arcade.collide(this.ghosts, this.ghosts, this.stopGhost, null, this);
                  this.physics.arcade.collide(this.pacman.sprite, this.ghosts, this.dead, null, this);
                  this.physics.arcade.overlap(this.pacman.sprite, this.pills, this.eatPill, null, this);

                  this.pacman.update(this);
                  this.ghost_blue.update(this);
                  this.ghost_red.update(this);
                  this.ghost_orange.update(this);
                  this.ghost_pink.update(this);
            } else {
                  this.add.text(220, 300, "Congratulations !", {fill: 'white', backgroundColor: 'black'});
                  this.add.text(150, 330, "Refresh to restart the game.", {fill: 'white', backgroundColor: 'black'});
            }
            
	}
};

