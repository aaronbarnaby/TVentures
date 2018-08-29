import * as _ from 'lodash';
import Sliders from '../interfaces/sliders';

var mainFont = '500 12.5pt Fira Sans';
var mainFontColor = '#FFBD29';
var choiceColor = '#FFFFFF';
var choiceHighlightColor = '#FFF700';
var choicePressColor = '#FFB000';
var fontColorPower = '#F45E14';
var fontColorKarma = '#12B516';
var fontColorIntellect = '#00B0FF';
var fontColorLove = '#FC32DA';

export default class StoryManager {
    
    game: any;
    
    // UI
    uiText: any;
    uiFrames: any;
    uiSliders: Sliders;
    uiMasks: any;
    
    textStyle: any;
    choicesStyle: any;
    
    // Player
    character: any;
    
    // Story
    storyData: any;
    
    storyText: Phaser.Text;
    
    battle: any;
    
    choicesGroup: Phaser.Group;
    choices: any;
    choicesHeight: number;
    loadedChoices: any;
    
    constructor(gameRef: Phaser.Game, startingNode: string) {
        this.choicesHeight = 100; // Default Height
        this.game = gameRef;

        this.setupTextStyles();
        this.setupFrames();
        this.setupSliders();
        this.setupMasks();

        this.setupText(startingNode);
        this.fadeInText();

        this.setupChoices();
        this.loadChoices(startingNode);
        
        this.adjustSliders();
    }

    makeDecision(choiceNumber) {
        // Add Method to Access Save Instance
        //STORY.currentSaveGame.writeToGameLog(STORY.currentSaveGame.currentNodeKey, choiceNumber);

        var choiceData = this.loadedChoices[choiceNumber];

        if (choiceData.ACTION === 'next') {
            var nextNode = choiceData.NEXT;

            this.loadStoryNode(nextNode);
        }
    }
    
    loadStoryNode(node) {
        var data = _.find(this.storyData, o => o.KEY === node);

        if (data) {
            if (typeof(data.ONENTER) !== "undefined") {
                if (data.ONENTER === 'END') {
                    this.storyText.setText(data.TEXT);
                    this.storyText.y = this.uiFrames.top.y;
                    this.fadeInText();

                    // Clear ALL Text
                    _.forEach(this.choices, (c) => {
                        c.setText('');
                    });
                    
                    // Add Method to Access Save Instance
                    // STORY.currentSaveGame.currentNodeKey = 'TT0'; // Reset Story

                    // Return To Menu
                    this.game.time.events.add(10000, () => {
                        this.game.state.start('Menu');
                    }, this);
                }
            }
        } else {
            alert(`Invalid Target Node: ${node}`);
        }
    }
    
    setupTextStyles() {
        this.textStyle = { font: mainFont, fill: mainFontColor, align: 'left', wordWrap: true, wordWrapWidth: this.uiFrames.top.width };
        this.choicesStyle = { font: 'bold 12pt Arial', fill: choiceColor, align: 'left', wordWrap: true, wordWrapWidth: this.uiFrames.bottom.width };
    }
    
    setupText(nodeKey) {
        var nodeData = _.find(this.storyData, o => o.KEY === nodeKey);
        this.storyText = this.game.add.text(this.uiFrames.top.x, this.uiFrames.top.y, nodeData.TEXT, this.textStyle);
        this.storyText.mask = this.uiMasks.storyText;
    }
    
    setupFrames() {
        this.uiFrames.top = {
            width: Math.round(this.game.width * 0.7225),
            height: Math.round(this.game.height * 0.5),
            y: Math.round(this.game.height * 0.12)
        };
        this.uiFrames.top.x = Math.round(((this.game.width - this.uiFrames.top.width) / 2) - 11);
        
        this.uiFrames.bottom = {
            width: Math.round(this.uiFrames.top.width),
            height: Math.round(this.game.height * 0.275 - 5),
            x: this.uiFrames.top.x
        };
        this.uiFrames.bold.y = Math.round(((this.game.height - this.uiFrames.top.y - this.uiFrames.top.height - this.uiFrames.bottom.height) / 2) + this.uiFrames.top.y + this.uiFrames.top.height);
    }
    
    setupSliders() {
        this.uiSliders = {
            top: this.game.add.sprite(this.game.width - this.uiFrames.top.x, this.uiFrames.top.y, 'slider01'),
            top_back: this.game.add.sprite(this.game.width - this.uiFrames.top.x, this.uiFrames.top.y, 'slider01_back'),
            bottom: this.game.add.sprite(this.game.width - this.uiFrames.bottom.x, this.uiFrames.bottom.y, 'slider01'),
            bottom_back: this.game.sprite(this.game.width - this.uiFrames.bottom.x, this.uiFrames.bottom.y, 'slider02_back')
        };
        
        this.uiSliders.top.frame = 0;
        this.uiSliders.top.inputEnabled = true;
        this.uiSliders.top.input.enableDrag({ boundsSprite: this.uiSliders.top_back });
        this.uiSliders.top.input.boundsSprite = this.uiSliders.top_back;
        this.uiSliders.top.input.dragFromCenter = false;
        this.uiSliders.top.input.allowHorizontalDrag = false;
        this.uiSliders.top.events.onInputOver.add(this.sliderOver, this);
        this.uiSliders.top.events.onInputOut.add(this.sliderOut, this);
        this.uiSliders.top.events.onInputDown.add(this.sliderDown, this);
        this.uiSliders.top_back.height = this.uiFrames.top.height;
        
        this.uiSliders.bottom.frame = 0;
        this.uiSliders.bottom.inputEnabled = true;
        this.uiSliders.bottom.input.enableDrag({ boundsSprite: this.uiSliders.bottom_back });
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
        
        var choicesSpacer = 15;
        var currentHeight = 0;
        for (let i = 0; i < 5; i++) {
            var yPos = this.uiFrames.bottom.y + currentHeight + (choicesSpacer * i);

            this.choices[i] = this.game.add.text(this.uiFrames.bottom.x, yPos, `Choice ${i}`, this.choicesStyle, this.choicesGroup)
            this.choices[i].inputEnabled = true;
            this.choices[i].input.useHandCursor = true;
            this.choices[i].events.onInputOver.add(this.choiceOver, this, 0, i);
            this.choices[i].events.onInputOut.add(this.choiceOut, this, 0, i);
            this.choices[i].events.onInputDown.add(this.choiceDown, this, 0, i);
            this.choices[i].events.onInputUp.add(this.choiceUp, this, 0, i);

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
        var choicesSpacer = 15;

        this.resetChoices();
        
        var nodeData = _.find(this.storyData, o => o.KEY === nodeKey);

        var index = 0;
        if (nodeData.CHOICES.length > 0) {
            _.forEach(nodeData.CHOICES, (i) => {
                if (this.checkChoiceDisplay(i)) {
                    this.choices[index].setText(i.TEXT);
                    this.choices[index].y = this.uiFrames.bottom.y + this.choicesHeight;
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
                    NEXT: nodeData.NEXT
                }
            };
        } else {
            alert('No Choices or NEXT node.')   
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
        item.fill = this.loadedChoices[index].color;
    }
    
    choiceDown(item) {
        item.fill = choicePressColor;
    }
    
    choiceUp(item, index) {
        item.fill = choiceHighlightColor;
        this.makeDecision(index);
    }
}