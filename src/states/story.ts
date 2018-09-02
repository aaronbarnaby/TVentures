import * as _ from 'lodash';
import StoryManager from '../lib/StoryManager';
import { Globals } from '../globals';
import { CONFIG } from '../config';

export default class StoryState extends Phaser.State {
    
    storyManager: StoryManager;
    
    keys: any = {};
    
    init() {
        this.game.stage.backgroundColor = '#000000';
    }
    
    create() {
        this.setupBackground();
        this.setupIcons();
        this.fadeInScreen();
        
        this.storyManager = new StoryManager();
        
        // Setup Keys for Debug
        if (CONFIG.debugMode) {
            this.keys.ctrl = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
            this.keys.B = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
            this.keys.C = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
            this.keys.H = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
            
            // DEBUG MODE Keyboard Inputs
            // - Ctrl + B = Borders
            // - Ctrl + C = Custom Modal
            
            this.keys.B.onDown.add(this.toggleBorders, this);
            this.keys.C.onDown.add(this.showDialog, this);
            this.keys.H.onDown.add(this.hideDialog, this);
        }
    }

    // Story UI
    
    // TODO: Move Stage components here
    
    
    // Core UI
    
    setupBackground() {
        var menuBg = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'menu_bg01');
        menuBg.anchor.setTo(0.5, 0.5);
        menuBg.alpha = 0.5;
        
        var blackGradient = this.game.add.sprite(0, 0, 'blackGradient');
        var blackGradient2 = this.game.add.sprite(0, 0, 'blackGradient');
        blackGradient.width = this.game.width;
        blackGradient2.width = this.game.width;
        blackGradient2.y = this.game.height;
        blackGradient2.scale.y = -1;
    }
    
    setupIcons() {
        var iconXoffset = this.game.width * 0.0625;
        
        var iconSaveButton = this.game.add.button(this.game.width - iconXoffset, this.game.height * 0.05, 'icons', this.iconSave, this, 4, 3, 5);
        iconSaveButton.anchor.setTo(0.5, 0.5);
        iconSaveButton.frame = 3;
        iconSaveButton.input.useHandCursor = true;
        
        var iconSoundButton = this.game.add.button(this.game.width - iconXoffset, this.game.height * 0.15, 'icons', this.toggleSound, this, 7, 6, 8);
        iconSoundButton.anchor.setTo(0.5, 0.5);
        iconSoundButton.frame = 6;
    }
    
    fadeInScreen() {
        var blackFade = this.game.add.sprite(0, 0, 'rectangle_black');
        blackFade.height = this.game.height;
        blackFade.width = this.game.width;
        var blackFadeTween = this.game.add.tween(blackFade);
        blackFadeTween.to({ alpha: 0 }, 500);
        blackFadeTween.onComplete.add(function () {
            blackFade.destroy();
        });
        blackFadeTween.start();
    }
    
    iconSave() {
        this.storyManager.stopAudio();
        Globals.saveManager.saveGame(true);
    }
    
    toggleSound() {
        Globals.hasSound = !Globals.hasSound;
        
        if (Globals.hasSound) {
            // Enabled
            this.storyManager.resumeAudio();
        } else {
            // Disabled
            this.storyManager.stopAudio();
        }
    }
    
    update() {
        // Move text based on sliders
        if (this.storyManager.uiSliders.top.visible === true) {
            this.storyManager.storyText.y = this.storyManager.uiText.top.topgap - (((this.storyManager.uiSliders.top.y - this.storyManager.uiText.top.topgap) / this.storyManager.uiText.top.rightgap) * this.storyManager.uiText.top.distance);
        }
        
        if (this.storyManager.uiSliders.bottom.visible === true) {
            this.storyManager.choicesGroup.y = 1 - (((this.storyManager.uiSliders.bottom.y - this.storyManager.uiText.bottom.topgap) / this.storyManager.uiText.bottom.rightgap) * this.storyManager.uiText.bottom.distance);
        }
    }

    // Debug Methods
    toggleBorders() {
        if (this.keys.ctrl.isDown) {
            // Toggle Borders
            if (this.storyManager.uiDebug && this.storyManager.uiDebug.topBorder) {
                this.storyManager.removeBorders();
            } else {
                this.storyManager.showBorders();
            }
        }
    }

    showDialog() {
        if (this.keys.ctrl.isDown) {
            this.storyManager.customClick();
        }
    }

    hideDialog() {
        if (this.keys.ctrl.isDown) {
            this.storyManager.hideModal();
        }
    }
}