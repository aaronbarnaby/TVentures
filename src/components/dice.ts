import * as Phaser from 'phaser-ce';
import { Globals } from "../globals";

export default class Dice extends Phaser.Sprite {
    
    tween: any;
    animation: any;
    
    constructor(x: number, y: number, type: string = "dice") {
        var game = Globals.game as Phaser.Game;
        super(game, x, y, type);
        
        this.anchor.setTo(0.5);
        
        var frames = [];
        for (var i = 0; i < 15; i++) {
            frames[i] = this.game.rnd.pick([1,2,5,6,4,0]);
        }
        
        this.animation = this.animations.add('roll', frames);
        this.animation.onComplete.add(this.rollComplete, this);
        
        this.frame = 1;
        
        this.game.add.existing(this);
    }
    
    roll() {
        this.animations.play('roll', 20);
    }
    
    rollComplete() {
        this.filters = null;
        this.frame = this.game.rnd.pick([1,2,5,6,4,0]);
        this.angle = 0;
    }
    
    isAnimationRunning() {
        return this.animation.isPlaying;
    }
    
    value() {
        switch(this.frame) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 5:
                return 3;
            case 6:
                return 4;
            case 4:
                return 5;
            case 0:
                return 6;
            default:
                return null;
        }
    }
    
    update() {
        if (this.animation.isPlaying) {
            this.angle = this.game.rnd.angle();
        }
    }
}