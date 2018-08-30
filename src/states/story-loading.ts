import { Globals } from "../globals";

var timeOut;

export default class StoryLoadingState extends Phaser.State {
    init() {}
    
    preload() {
        let loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBg");
        let loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBar");
        loaderBg.anchor.setTo(0.5);
        loaderBar.anchor.setTo(0.5);
        
        this.load.setPreloadSprite(loaderBar);
        
        timeOut = this.time.events.add(Phaser.Timer.SECOND * 20, this.loadingTimeOut, this);
        
        // Load Story
        Globals.activeStory.textManager.loadStory(Globals.save.currentStory);
    }
    
    create() {}
    
    update() {
        // Wait for JSON data to finish loading
        if (Globals.activeStory.LoadedFlag) {
            this.time.events.remove(timeOut);
            Globals.activeStory.LoadedFlag = false;
            this.state.start('Story');
        }
    }
    
    loadingTimeOut() {
        console.log('Story loading timed out.');
        this.state.start('Menu');
    }
}