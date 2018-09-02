import * as _ from 'lodash';
import { Globals } from '../globals';
import Sliders from '../interfaces/sliders';
import StoryNode from '../interfaces/storyNode';

import Dice from '../components/dice';

var mainFont = '500 12.5pt Fira Sans';
var mainFontColor = '#FFBD29';
var choiceColor = '#FFFFFF';
var choiceHighlightColor = '#FFF700';
var choicePressColor = '#FFB000';
var fontColorPower = '#F45E14';
var fontColorKarma = '#12B516';
var fontColorIntellect = '#00B0FF';
var fontColorLove = '#FC32DA';

var choicesSpacer = 15;

export default class StoryManager {
    
    game: Phaser.Game;
    
    // UI
    uiDebug: any = {};
    uiText: any = {};
    uiFrames: any = {};
    uiSliders: Sliders;
    uiMasks: any = {};
    uiButtons: any = {};
    uiModal: any;
    
    textStyle: any;
    choicesStyle: any;
    
    // Player
    character: any = {};
    
    // Story
    storyData: [StoryNode];
    backgroundSounds: [any];
    
    storyText: Phaser.Text;
    
    battle: any;
    
    choicesGroup: Phaser.Group;
    choicesHeight: number;
    choices: any = [];
    loadedChoices: any = [];
    
    constructor() {
        this.choicesHeight = 100; // Default Height
        this.game = Globals.game;
        this.storyData = Globals.activeStory.storyData;
        
        this.setupFrames();
        this.setupSliders();
        this.setupMasks();
        
        this.setupButtons();
        
        this.setupTextStyles();
        this.setupText();
        
        this.setupChoices();
        
        this.loadStoryNode(Globals.save.currentNodeKey);
    }
    
    makeDecision(choiceNumber) {
        this.resetAudio(); // Stop any looping background sound from previous node
        
        // Add Method to Access Save Instance
        Globals.save.writeToGameLog(choiceNumber);
        
        var choiceData = this.loadedChoices[choiceNumber].data;
        
        if (choiceData.ACTION === 'next') {
            var nextNode = choiceData.NEXT;
            
            this.loadStoryNode(nextNode);
        }
        
        if (choiceData.ACTION === 'redirect') {
            this.game.state.start(choiceData.TARGET);
        }
    }
    
    loadStoryNode(node) {
        var data = _.find(this.storyData, o => o.KEY === node);
        
        if (data) {
            this.storyText.setText(data.TEXT);
            this.storyText.y = this.uiFrames.top.y;
            this.fadeInText();
            
            this.loadChoices(data.KEY);
            this.adjustSliders();
            
            Globals.save.currentNodeKey = data.KEY;
            
            if (typeof(data.ONENTER) !== "undefined") {
                _.forEach(data.ONENTER, (x) => {
                    if (x.type === 'end') {
                        // Add Method to Access Save Instance
                        Globals.save.currentNodeKey = Globals.activeStory.startingNode;
                        
                        // Return To Menu
                        this.game.time.events.add(10000, () => {
                            this.game.state.start('Menu');
                        }, this);
                    } else if (x.type === 'audio') {
                        let audioClip = this.game.add.audio(x.target, (x.volume || 1), (x.loop || false));
                        
                        if (Globals.hasSound) {
                            // Check for Delayed Play
                            if (x.delay) {
                                this.game.time.events.add(x.delay, () => {
                                    audioClip.play();
                                }, this);
                            } else {
                                audioClip.play();
                            }
                        }
                        
                        if (this.backgroundSounds) {
                            this.backgroundSounds.push({ sound: audioClip, loop: x.loop });
                        } else {
                            this.backgroundSounds = [{ sound: audioClip, loop: x.loop }];
                        }
                    }
                });
            }
        } else {
            alert(`Invalid Target Node: ${node}`);
        }
    }
    
    characterClick() {
        
    }
    
    abilitiesClick() {
        
    }
    
    customClick() {
        this.displayModal('dice_3');
    }
    
    displayModal(type) {
        this.hideModal();
        
        var hasClose = true;
        
        var modal = this.game.add.group();
        
        var back = this.game.add.sprite(0, 0, 'modal_bg');
        back.height = 200;
        back.z = 10;
        modal.add(back);
        
        modal.x = (this.game.width  / 2) - (modal.width / 2);
        modal.y = (this.game.height / 2) - (modal.height / 2);
        
        var typeSplit = type.split('_');
        var handle = typeSplit[0];
        if (handle === 'dice') {
            var diceAmount = typeSplit[1]; // 1 - 5
            if (!diceAmount) { diceAmount = 1; }
            if (diceAmount > 5) { diceAmount = 5; }
            
            var diceGroup = this.game.add.group();
            
            var diceSpacer = 20;
            var diceWidth = 0;
            for (var i = 0; i < diceAmount; i++) {
                var dice = new Dice(diceWidth + (diceSpacer * i), diceGroup.y);
                dice.z = 11;
                diceWidth += dice.width;
                diceGroup.add(dice);
            }
            
            diceGroup.x = ((modal.width / 2) - (diceGroup.width / 2)) + 32;
            diceGroup.y = modal.height * 0.3;
            modal.add(diceGroup);
            
            // Total Display
            var diceTotal = this.game.add.text((modal.width / 2) - 20, modal.height * 0.65, '', { font: 'bold 26pt Arial', fill: '#FFFFFF', align: 'center' });
            modal.add(diceTotal);
            
            var diceControls = this.game.add.group();
            var rollDiceBtn = this.game.add.button(((modal.width / 2) - 95), modal.height * 0.7, 'buttons', this.rollDice, this, 5, 4, 5, null, diceControls);
            rollDiceBtn.input.useHandCursor = true;
            this.game.add.text(rollDiceBtn.x + 65, rollDiceBtn.y + 5, 'Roll Dice', { font: 'bold 12pt Arial', fill: choiceColor, align: 'left' }, diceControls);
            
            modal.add(diceControls);
            
            hasClose = false;
        }
        
        if (hasClose) {
            var closeBtn = this.game.add.sprite(back.width - 5, 10, 'close_btn');
            closeBtn.z = 9;
            closeBtn.inputEnabled = true;
            closeBtn.events.onInputDown.add(this.hideModal, this);
            
            modal.add(closeBtn);
        }
        
        this.uiModal = {};
        this.uiModal.modal = modal;
        
        if (handle === 'dice') {
            this.uiModal.diceGroup = diceGroup;
            this.uiModal.diceControls = diceControls;
            this.uiModal.diceTotal = diceTotal;
        }
    }
    
    rollDice() {
        if (this.uiModal && this.uiModal.diceGroup) {
            // Remove Controls When Triggered
            this.uiModal.diceControls.visible = false;

            // Trigger Dice Roll
            this.uiModal.diceGroup.callAll('roll', null);
            this.game.time.events.add(100, this.rollDiceCompleted, this);
        }
    }
    
    rollDiceCompleted() {
        if (this.uiModal && this.uiModal.diceGroup) {
            var rollComplete = true;
            this.uiModal.diceGroup.forEach((item) => {
                if (item.isAnimationRunning())
                rollComplete = false;
            }, this);
            if (rollComplete) {
                var total = 0;
                this.uiModal.diceGroup.forEach(function(item) { total += item.value(); });
                
                this.uiModal.diceTotal.setText(total);
                this.game.time.events.add(2000, this.rollDiceCallback, this, total);
            } else {
                var timer = this.game.time.events.add(100, this.rollDiceCompleted, this);
            }
        }
    }

    rollDiceCallback(diceTotal) {
        console.log(`Dice Total: ${diceTotal}`);
        // TODO: Do something with the dice total that was required.

        this.hideModal();
    }
    
    hideModal() {
        if (this.uiModal && this.uiModal.modal) {
            this.uiModal.modal.destroy();
            this.uiModal = null;
        }
    }
    
    resetAudio() {
        this.stopAudio();
        this.backgroundSounds = null;
    }
    
    setupTextStyles() {
        this.textStyle = { font: mainFont, fill: mainFontColor, align: 'left', wordWrap: true, wordWrapWidth: this.uiFrames.top.width };
        this.choicesStyle = { font: 'bold 12pt Arial', fill: choiceColor, align: 'left', wordWrap: true, wordWrapWidth: this.uiFrames.bottom.width };
    }
    
    setupText() {
        this.storyText = this.game.add.text(this.uiFrames.top.x, this.uiFrames.top.y, "", this.textStyle);
        this.storyText.mask = this.uiMasks.storyText;
    }
    
    setupFrames() {
        this.uiFrames.top = {
            width: Math.round(this.game.width * 0.8),
            height: Math.round(this.game.height * 0.45),
            y: Math.round(this.game.height * 0.05)
        };
        this.uiFrames.top.x = Math.round(((this.game.width - this.uiFrames.top.width) / 2) - 11);
        
        this.uiFrames.bottom = {
            width: Math.round(this.uiFrames.top.width) + 60,
            height: Math.round(this.game.height * 0.275 - 5),
            x: this.uiFrames.top.x - 20
        };
        this.uiFrames.bottom.y = Math.round(((this.game.height - this.uiFrames.top.y - this.uiFrames.top.height - this.uiFrames.bottom.height) / 2) + this.uiFrames.top.y + this.uiFrames.top.height);
        
        this.uiFrames.buttons = {
            width: Math.round(this.uiFrames.top.width),
            height: 40,
            x: this.uiFrames.top.x,
            y: this.uiFrames.bottom.y - 50
        };
    }
    
    setupButtons() {
        var buttonTextStyle = { font: 'bold 12pt Arial', fill: choiceColor, align: 'left' };
        
        this.uiButtons.characterGroup = this.game.add.group();
        this.uiButtons.character = this.game.add.button(this.uiFrames.buttons.x, this.uiFrames.buttons.y, 'buttons', this.characterClick, this, 1, 0, 1, null, this.uiButtons.characterGroup);
        this.uiButtons.character.input.useHandCursor = true;
        this.game.add.text(this.uiButtons.character.x + 50, this.uiButtons.character.y + 5, 'CHARACTER', buttonTextStyle, this.uiButtons.characterGroup);
        this.uiButtons.characterGroup.visible = false;
        
        this.uiButtons.abilitiesGroup = this.game.add.group();
        this.uiButtons.abilities = this.game.add.button((this.uiFrames.buttons.x + this.uiButtons.character.width + 15), this.uiFrames.buttons.y, 'buttons', this.abilitiesClick, this, 3, 2, 3, null, this.uiButtons.abilitiesGroup);
        this.uiButtons.abilities.input.useHandCursor = true;
        this.game.add.text(this.uiButtons.abilities.x + 60, this.uiButtons.abilities.y + 5, 'ABILITIES', buttonTextStyle, this.uiButtons.abilitiesGroup);
        this.uiButtons.abilitiesGroup.visible = false;
        
        this.uiButtons.customGroup = this.game.add.group();
        this.uiButtons.custom = this.game.add.button((this.uiFrames.buttons.x + this.uiButtons.character.width + this.uiButtons.abilities.width + 30), this.uiFrames.buttons.y, 'buttons', this.customClick, this, 5, 4, 5, null, this.uiButtons.customGroup);
        this.uiButtons.custom.input.useHandCursor = true;
        this.game.add.text(this.uiButtons.custom.x + 65, this.uiButtons.custom.y + 5, 'CUSTOM', buttonTextStyle, this.uiButtons.customGroup);
        this.uiButtons.customGroup.visible = false;
    }
    
    setupSliders() {
        this.uiSliders = {
            top: this.game.add.sprite(this.game.width - this.uiFrames.top.x, this.uiFrames.top.y, 'slider01'),
            top_back: this.game.add.sprite(this.game.width - this.uiFrames.top.x, this.uiFrames.top.y, 'slider01_back'),
            bottom: this.game.add.sprite(this.game.width - this.uiFrames.bottom.x, this.uiFrames.bottom.y, 'slider01'),
            bottom_back: this.game.add.sprite(this.game.width - this.uiFrames.bottom.x, this.uiFrames.bottom.y, 'slider02_back')
        };
        
        this.uiSliders.top.frame = 0;
        this.uiSliders.top.inputEnabled = true;
        this.uiSliders.top.input.enableDrag(null, null, null, null, null, this.uiSliders.top_back);
        this.uiSliders.top.input.boundsSprite = this.uiSliders.top_back;
        this.uiSliders.top.input.dragFromCenter = false;
        this.uiSliders.top.input.allowHorizontalDrag = false;
        this.uiSliders.top.events.onInputOver.add(this.sliderOver, this);
        this.uiSliders.top.events.onInputOut.add(this.sliderOut, this);
        this.uiSliders.top.events.onInputDown.add(this.sliderDown, this);
        this.uiSliders.top_back.height = this.uiFrames.top.height;
        
        this.uiSliders.bottom.frame = 0;
        this.uiSliders.bottom.inputEnabled = true;
        this.uiSliders.bottom.input.enableDrag(null, null, null, null, null, this.uiSliders.bottom_back);
        this.uiSliders.bottom.input.boundsSprite = this.uiSliders.bottom_back;
        this.uiSliders.bottom.input.dragFromCenter = false;
        this.uiSliders.bottom.input.allowHorizontalDrag = false;
        this.uiSliders.bottom.events.onInputOver.add(this.sliderOver, this);
        this.uiSliders.bottom.events.onInputOut.add(this.sliderOut, this);
        this.uiSliders.bottom.events.onInputDown.add(this.sliderDown, this);
        this.uiSliders.bottom_back.height = this.uiFrames.bottom.height;
    }
    
    setupMasks() {
        this.uiMasks = {
            storyText: this.game.add.graphics(0, 0),
            choices: this.game.add.graphics(0, 0)
        };
        this.uiMasks.storyText.beginFill(0xffffff);
        this.uiMasks.storyText.drawRect(this.uiFrames.top.x, this.uiFrames.top.y, this.game.width, this.uiFrames.top.height);
        this.uiMasks.choices.beginFill(0xffffff);
        this.uiMasks.choices.drawRect(this.uiFrames.bottom.x, this.uiFrames.bottom.y, this.game.width, this.uiFrames.bottom.height);
    }
    
    setupChoices() {
        this.choicesGroup = this.game.add.group();
        
        var currentHeight = 0;
        for (let i = 0; i < 5; i++) {
            var yPos = this.uiFrames.bottom.y + currentHeight + (choicesSpacer * i);
            
            this.choices[i] = this.game.add.text(this.uiFrames.bottom.x, yPos, `Choice ${i}`, this.choicesStyle, this.choicesGroup)
            this.choices[i].inputEnabled = true;
            this.choices[i].input.useHandCursor = true;
            this.choices[i].events.onInputOver.add(this.choiceOver, this, 0);
            this.choices[i].events.onInputOut.add(() => this.choiceOut(this.choices[i], i), this, 0);
            this.choices[i].events.onInputDown.add(this.choiceDown, this, 0);
            this.choices[i].events.onInputUp.add(() => this.choiceUp(this.choices[i], i), this, 0);
            
            currentHeight += this.choices[i].height;
        }
        
        this.choicesGroup.mask = this.uiMasks.choices;
    }
    
    adjustSliders() {
        // Adjust slider height based on amount of text, or else hide
        this.uiSliders.top.y = this.uiFrames.top.y;
        this.uiSliders.bottom.y = this.uiFrames.bottom.y;
        
        if (this.storyText.height > this.uiFrames.top.height) {
            this.uiSliders.top.visible = true;
            this.uiSliders.top_back.visible = true;
            this.uiSliders.top.height = (this.uiFrames.top.height / this.storyText.height) * this.uiFrames.top.height;
            this.fadeSlider(this.uiSliders.top, 0, 500);
            this.fadeSlider(this.uiSliders.top_back, 0, 500);
            
            // Slider movement calculations
            this.uiText.top = {};
            this.uiText.top.rightgap = this.uiSliders.top_back.height - this.uiSliders.top.height;
            this.uiText.top.distance = (this.uiText.top.rightgap / this.uiSliders.top_back.height) * this.storyText.height;
            this.uiText.top.topgap = this.uiFrames.top.y;
        } else {
            this.uiSliders.top.height = this.uiFrames.top.height;
            this.uiSliders.top.visible = false;
            this.uiSliders.top_back.visible = false;
        }
        if (this.choicesHeight > this.uiFrames.bottom.height) {
            this.uiSliders.bottom.visible = true;
            this.uiSliders.bottom_back.visible = true;
            this.uiSliders.bottom.height = (this.uiFrames.bottom.height / this.choicesHeight) * this.uiFrames.bottom.height;
            this.fadeSlider(this.uiSliders.bottom, 500, 200);
            this.fadeSlider(this.uiSliders.bottom_back, 500, 200);
            
            // Slider movement calculations
            this.uiText.bottom = {};
            this.uiText.bottom.rightgap = this.uiSliders.bottom_back.height - this.uiSliders.bottom.height;
            this.uiText.bottom.distance = (this.uiText.bottom.rightgap / this.uiSliders.bottom_back.height) * this.choicesGroup.height;
            this.uiText.bottom.topgap = this.uiFrames.bottom.y;
        } else {
            this.uiSliders.bottom.height = this.uiFrames.bottom.height;
            this.uiSliders.bottom.visible = false;
            this.uiSliders.bottom_back.visible = false;
        }
    }
    
    fadeSlider(slider, delay, duration) {
        slider.alpha = 0;
        
        this.game.time.events.add(delay, function () {
            this.game.add.tween(slider).to({ alpha: 1 }, duration, Phaser.Easing.Linear.None, true);
        }, this);
    }
    
    resetChoices() {
        this.loadedChoices.length = 0;
        this.choicesGroup.y = 0;
        
        _.forEach(this.choices, (c) => {
            c.setText('');
            c.fill = choiceColor;
        });
        this.choicesHeight = 0;
    }
    
    loadChoices(nodeKey) {
        this.resetChoices();
        
        var nodeData = _.find(this.storyData, o => o.KEY === nodeKey);
        
        var index = 0;
        if (nodeData.CHOICES && nodeData.CHOICES.length > 0) {
            _.forEach(nodeData.CHOICES, (i) => {
                if (this.checkChoiceDisplay(i)) {
                    this.choices[index].setText(i.TEXT);
                    this.choices[index].y = this.uiFrames.bottom.y + this.choicesHeight + ((index !== 0) ? choicesSpacer : 0);
                    this.choices[index].fill = this.checkChoiceColor(i);
                    this.choicesHeight += this.choices[index].height + ((index !== 0) ? choicesSpacer : 0);
                    
                    this.loadedChoices[index] = {
                        color: this.choices[index].fill,
                        data: i
                    };
                    index++;
                }
            });
        } else if (nodeData.NEXT) {
            // No Choices, Add a Continue
            this.choices[0].setText('Continue...');
            this.choices[0].y = this.uiFrames.bottom.y;
            this.choicesHeight = this.choices[0].height;
            this.loadedChoices[0] = {
                color: this.choices[0].fill,
                data: {
                    ACTION: 'next',
                    NEXT: nodeData.NEXT
                }
            };
        }
    }
    
    checkChoiceDisplay(choiceData) {
        // TODO: Add Choice Costs
        
        // There are no costs for this choice
        return true;
    }
    
    checkChoiceColor(choiceData) {
        if (typeof(choiceData.COLOR) !== "undefined") {
            if (choiceData.COLOR === 'red') {
                return '#F00E0E';
            }
        }
        
        if (typeof(choiceData.REQUIRED_TYPE) !== "undefined") {
            if (choiceData.REQUIRED_TYPE === 'power') {
                return fontColorPower;
            }
            if (choiceData.REQUIRED_TYPE === 'intellect') {
                return fontColorIntellect;
            }
            if (choiceData.REQUIRED_TYPE === 'karma') {
                return fontColorKarma;
            }
            if (choiceData.REQUIRED_TYPE === 'love') {
                return fontColorLove;
            }
        }
        
        return choiceColor;
    }
    
    fadeInText() {
        this.storyText.alpha = 0;
        this.game.add.tween(this.storyText).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
    }
    
    fadeInChoice(choice, delay) {
        choice.alpha = 0;
        
        this.game.time.events.add(delay, function () {
            this.game.add.tween(choice).to({ alpha: 1 }, 200, Phaser.Easing.Linear.None, true);
        }, this);
    }
    
    sliderOver(sprite) {
        sprite.frame = 1;
    }
    
    sliderOut(sprite) {
        sprite.frame = 0;
    }
    
    sliderDown(sprite) {
        sprite.frame = 2;
    }
    
    choiceOver(item) {
        item.fill = choiceHighlightColor;
    }
    
    choiceOut(item, index) {
        let choice = this.loadedChoices[index];
        if (choice && choice.color) {
            item.fill = choice.color;
        }
    }
    
    choiceDown(item) {
        item.fill = choicePressColor;
    }
    
    choiceUp(item, index) {
        item.fill = choiceHighlightColor;
        this.makeDecision(index);
    }
    
    stopAudio() {
        if (this.backgroundSounds && this.backgroundSounds.length > 0) {
            // Stop and Remove
            _.forEach(this.backgroundSounds, (x) => {
                x.sound.stop();
            });
        }
    }
    
    resumeAudio() {
        if (this.backgroundSounds && this.backgroundSounds.length > 0) {
            // Stop and Remove
            _.forEach(this.backgroundSounds, (x) => {
                if (x.loop) {
                    x.sound.play();
                }
            });
        }
    }
    
    showBorders() {
        var topBorder = this.game.add.graphics(this.uiFrames.top.x, this.uiFrames.top.y);
        topBorder.lineStyle(2, 0xffd900, 1);
        topBorder.moveTo(0, 0);
        topBorder.lineTo(this.uiFrames.top.width, 0);
        topBorder.lineTo(this.uiFrames.top.width, this.uiFrames.top.height);
        topBorder.lineTo(0, this.uiFrames.top.height);
        topBorder.lineTo(0, 0);
        this.uiDebug.topBorder = topBorder;
        
        var bottomBorder = this.game.add.graphics(this.uiFrames.bottom.x, this.uiFrames.bottom.y);
        bottomBorder.lineStyle(2, 0xffd900, 1);
        bottomBorder.moveTo(0, 0);
        bottomBorder.lineTo(this.uiFrames.bottom.width, 0);
        bottomBorder.lineTo(this.uiFrames.bottom.width, this.uiFrames.bottom.height);
        bottomBorder.lineTo(0, this.uiFrames.bottom.height);
        bottomBorder.lineTo(0, 0);
        this.uiDebug.bottomBorder = bottomBorder;
        
        var buttonsBorder = this.game.add.graphics(this.uiFrames.buttons.x, this.uiFrames.buttons.y);
        buttonsBorder.lineStyle(2, 0xffd900, 1);
        buttonsBorder.moveTo(0, 0);
        buttonsBorder.lineTo(this.uiFrames.buttons.width, 0);
        buttonsBorder.lineTo(this.uiFrames.buttons.width, this.uiFrames.buttons.height);
        buttonsBorder.lineTo(0, this.uiFrames.buttons.height);
        buttonsBorder.lineTo(0, 0);
        this.uiDebug.buttonsBorder = buttonsBorder;
    }
    
    removeBorders() {
        this.uiDebug.topBorder.destroy();
        this.uiDebug.bottomBorder.destroy();
        this.uiDebug.buttonsBorder.destroy();
        this.uiDebug = {};
    }
}