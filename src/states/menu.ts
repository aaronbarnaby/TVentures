import SaveManager from "../lib/SaveManager";
import { Globals } from "../globals";

export default class MenuState extends Phaser.State {
    
    saveManager: SaveManager;
    
    music: any;
    
    create() {
        this.saveManager = new SaveManager();
        
        this.setupBackground();
        this.setupButtons();        
        
        // Text info
        var styleMenuText02 = { font: 'bold 12pt Arial', fill: '#3A3A3A', align: 'left' };
        var menuText = this.game.add.text(this.game.width / 2, this.game.height * 0.9533, 'Aaron Barnaby', styleMenuText02);
        menuText.anchor.setTo(0.5, 0.5);
        
        // Fade in
        var blackFade = this.game.add.sprite(0, 0, 'rectangle_black');
        blackFade.height = this.game.height;
        blackFade.width = this.game.width;
        var blackFadeTween = this.game.add.tween(blackFade);
        blackFadeTween.to({ alpha: 0 }, 500);
        blackFadeTween.start();
        blackFadeTween.onComplete.add(function () {
            blackFade.destroy();
        });
        
        this.music = this.add.audio('melody', 0.1, true);

        if (Globals.hasSound) {
            this.music.play();
        }
    }
    
    newGameStart() {
        this.music.stop();
        
        // Start New Game
        
        this.saveManager.newGame('TWIN_TERROR');
        
        this.game.state.start('StoryLoading');
    }
    
    loadGameStart() {
        this.music.stop();
        
        // Resume Game
        this.saveManager.loadGame();
    }

    toggleSound() {
        Globals.hasSound = !Globals.hasSound;

        if (Globals.hasSound) {
            // Enabled
            this.music.play();
        } else {
            // Disabled
            this.music.stop();
        }
    }
    
    setupButtons() {
        // Menu items
        var styleMenuText01 = { font: 'bold 20pt Arial', fill: '#FFF', align: 'left' };
        var gameTitle = this.game.add.text(this.game.width / 2, this.game.height * 0.3433, 'Text Adventures', styleMenuText01);
        gameTitle.anchor.setTo(0.5, 0.5);
        
        // over, out, down
        var newGameButton = this.game.add.button(this.game.width / 2, this.game.height * 0.5333, 'menu01', this.newGameStart, this, 1, 0, 2);
        newGameButton.anchor.setTo(0.5, 0.5);
        newGameButton.frame = 0;
        newGameButton.input.useHandCursor = true;
        
        var loadGameButton = this.game.add.button(this.game.width / 2, this.game.height * 0.6333, 'menu01', this.loadGameStart, this, 4, 3, 5);
        loadGameButton.anchor.setTo(0.5, 0.5);
        loadGameButton.frame = 3;
        
        if (!this.saveManager.hasSave()) {
            loadGameButton.visible = false;
        }
        
        var iconXoffset = this.game.width * 0.0625;
        var iconSoundButton = this.game.add.button(this.game.width - iconXoffset, this.game.height * 0.9283, 'icons', this.toggleSound, this, 7, 6, 8);
        iconSoundButton.frame = 6;
        iconSoundButton.anchor.setTo(0.5, 0.5);
    }
    
    setupBackground() {
        this.game.stage.backgroundColor = '#000000';
        
        var backgroundCircle01 = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'menu_bg_circle01');
        backgroundCircle01.anchor.setTo(0.5, 0.5);
        var backgroundCircle02 = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'menu_bg_circle02');
        backgroundCircle02.anchor.setTo(0.5, 0.5);
        var backgroundCircle03 = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'menu_bg_circle03');
        backgroundCircle03.anchor.setTo(0.5, 0.5);
        
        this.game.add.tween(backgroundCircle01).to({ angle: -360 }, 130000, Phaser.Easing.Linear.None, true).loop(true);
        this.game.add.tween(backgroundCircle02).to({ angle: 360 }, 80000, Phaser.Easing.Linear.None, true).loop(true);
        this.game.add.tween(backgroundCircle03).to({ angle: -360 }, 30000, Phaser.Easing.Linear.None, true).loop(true);
        
        var blackGradient = this.game.add.sprite(0, 0, 'blackGradient');
        var blackGradient2 = this.game.add.sprite(0, 0, 'blackGradient');
        blackGradient.width = this.game.width;
        blackGradient2.width = this.game.width;
        blackGradient2.y = this.game.height;
        blackGradient2.scale.y = -1;
    }
}