import * as WebFont from 'webfontloader';

import { ASSETS, CONFIG } from '../config';
import { Globals } from '../globals';

export default class SplashState extends Phaser.State {
    
    fontsReady: boolean;
    
    init() {
        this.stage.backgroundColor = '#000000';
        
        this.fontsReady = false;
        this.fontsLoaded = this.fontsLoaded.bind(this);
    }
    
    preload() { 
        let loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBg");
        let loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBar");
        loaderBg.anchor.setTo(0.5);
        loaderBar.anchor.setTo(0.5);
        
        this.load.setPreloadSprite(loaderBar);
        
        /// Load WebFonts
        if (CONFIG.webfonts.length) {
            WebFont.load({
                google: {
                    families: CONFIG.webfonts
                },
                active: this.fontsLoaded
            });
        }
        
        /// Load Assets
        this.load.image('menu_bg01', ASSETS.menuBg01);
        this.load.image('menu_bg_circle01', ASSETS.menuBgCircle01);
        this.load.image('menu_bg_circle02', ASSETS.menuBgCircle02);
        this.load.image('menu_bg_circle03', ASSETS.menuBgCircle03);
        this.load.image('slider01_back', ASSETS.slider01_back);
        this.load.image('slider02_back', ASSETS.slider02_back);
        this.load.image('rectangle_black', ASSETS.rectangle_black);
        this.load.image('blackGradient', ASSETS.blackGradient);

        this.load.image('modal_bg', ASSETS.modal_bg);
        this.load.image('close_btn', ASSETS.close_btn);
        
        this.load.spritesheet('menu01', ASSETS.menu01, 146, 26);
        this.load.spritesheet('menu02', ASSETS.menu02, 58, 30);
        this.load.spritesheet('icons', ASSETS.icons, 40, 40);
        this.load.spritesheet('slider01', ASSETS.slider01, 13, 62);
        this.load.spritesheet('buttons', ASSETS.buttons, 200, 28);
        this.load.spritesheet('dice', ASSETS.dice, 64, 64);
        this.load.spritesheet('dice_red', ASSETS.dice_red, 64, 64);
        
        this.load.audio('melody', ASSETS.melody, true);
    }
    
    create() {
        let loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBg");
        let loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBar");
        loaderBg.anchor.setTo(0.5);
        loaderBar.anchor.setTo(0.5);
        
        this.load.setPreloadSprite(loaderBar);

        // Set Global `game` variable
        Globals.game = this.game;
    }
    
    render() {
        if (CONFIG.webfonts.length && this.fontsReady) {
            this.game.state.start("Menu");
        }
        
        if (!CONFIG.webfonts.length) {
            this.game.state.start("Menu");
        }
    }
    
    initializeScaleMode() { // set game screen to scale proportionally
        // https://phaser.io/examples/v2/input/game-scale
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.setMinMax(CONFIG.gameMinWidth, CONFIG.gameMinHeight, CONFIG.gameWidth, CONFIG.gameHeight);
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = false;
        this.scale.windowConstraints.bottom = 'visual'; // constrain to displayed screen area
    }
    
    fontsLoaded() {
        this.fontsReady = true;
    }
}