
export default class BonusLoadingState extends Phaser.State {
    init() {}
    
    preload() {
        let loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBg");
        let loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBar");
        loaderBg.anchor.setTo(0.5);
        loaderBar.anchor.setTo(0.5);
        
        this.load.setPreloadSprite(loaderBar);
        
        // Load Bonus Game Asses

        // Sounds
        this.load.audio('pacman_beginning', './assets/bonus/pacman/sounds/pacman_beginning.wav', true);
        this.load.audio('pacman_eatpill', './assets/bonus/pacman/sounds/pacman_eatpill.wav', true);
        this.load.audio('pacman_lifeup', './assets/bonus/pacman/sounds/pacman_lifeup.wav', true);
        this.load.audio('pacman_deadghost', './assets/bonus/pacman/sounds/pacman_deadghost.wav', true);
        this.load.audio('pacman_death', './assets/bonus/pacman/sounds/pacman_death.wav', true);
        this.load.audio('pacman_eatfruit', './assets/bonus/pacman/sounds/pacman_eatfruit.wav', true);
        this.load.audio('pacman_eatghost', './assets/bonus/pacman/sounds/pacman_eatghost.wav', true);
        this.load.audio('pacman_ghostrun', './assets/bonus/pacman/sounds/pacman_ghostrun.wav', true);

        // Map
        this.load.tilemap('map', './assets/bonus/pacman/map_pacman.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.spritesheet('pacman_tiles', './assets/bonus/pacman/Pacman.png', 32, 32);
        //this.load.image('tile', './assets/bonus/pacman/maps/tile.png');
        //this.load.image('safetile', './assets/bonus/pacman/maps/safetile.png');
        
        // Items
        this.load.image('dot', './assets/bonus/pacman/dot.png');
        this.load.image('pill', './assets/bonus/pacman/pills/spr_pill_0.png');
        this.load.image('cherry', './assets/bonus/pacman/cherry/spr_cherry_0.png');
        
        // Pacman
        this.load.spritesheet('pacman_walk', './assets/bonus/pacman/pacman/pacman_walk.png', 32, 32);
        this.load.spritesheet('pacman_death', './assets/bonus/pacman/pacman/pacman_death.png', 32, 32);
        this.load.image('pacman_life_counter', './assets/bonus/pacman/pacman/spr_lifecounter_0.png');

        // Ghosts
        this.loadGhost('blue');
        this.loadGhost('red');
        this.loadGhost('orange');
        this.loadGhost('pink');
    }
    
    create() {
        this.game.state.start('BonusGame');
    }

    loadGhost(color) {
        var name = 'ghost_' + color;
        var spritesheets = {
			afraid: {name: name + '_' + 'afraid', path: './assets/bonus/pacman/sprites/ghost/ghost_afraid.png'},
			normal: {name: name + '_' + 'normal', path: './assets/bonus/pacman/sprites/ghost/spr_ghost_' + color + '_0.png'},
        };
        
        this.load.spritesheet(spritesheets.afraid.name, spritesheets.afraid.path, 32, 32);
        this.load.image(spritesheets.normal.name, spritesheets.normal.path);
    }
}