import * as _ from 'lodash';
import StoryManager from '../lib/StoryManager';
import SaveManager from '../lib/SaveManager';
import { Globals } from '../globals';

export default class StoryState extends Phaser.State {
    
    storyManager: StoryManager;
    
    init() {
        this.game.stage.backgroundColor = '#000000';
    }
    
    create() {
        this.setupBackground();
        this.setupIcons();
        this.fadeInScreen();

        this.storyManager = new StoryManager();
    }
    
    setupBackground() {
        var menuBg = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'menu_bg01');
        menuBg.anchor.setTo(0.5, 0.5);
        menuBg.alpha = 0.75;
        
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
        Globals.saveManager.saveGame(true);
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
}