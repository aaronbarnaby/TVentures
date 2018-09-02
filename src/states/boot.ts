import { ASSETS, CONFIG } from '../config';
import { Globals } from '../globals';

export default class BootState extends Phaser.State {
    
    init() {
        this.stage.backgroundColor = '#000000';
        
        //  Unless you specifically need to support multitouch I would recommend setting this to 1
        this.input.maxPointers = 1;
        
        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;
        
        // Enable physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    }
    
    preload() {
        this.initializeScaleMode();
        
        /// Load Loader
        this.load.image("loaderBg", ASSETS.loaderBg);
        this.load.image("loaderBar", ASSETS.loadingBar);
    }
    
    create() {
        this.game.state.start("Splash");
    }
    
    initializeScaleMode() { // set game screen to scale proportionally
        // https://phaser.io/examples/v2/input/game-scale
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.setMinMax(CONFIG.gameMinWidth, CONFIG.gameMinHeight, CONFIG.gameWidth, CONFIG.gameHeight);
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = false;
        this.scale.windowConstraints.bottom = 'visual'; // constrain to displayed screen area
    }
}