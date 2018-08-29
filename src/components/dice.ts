
// PRELOAD
// this.load.script("BlurX", "BlurX.js");
// this.load.script("BlurY", "BlurY.js");
// this.load.spritesheet("dice", ASSETS.dice, 100, 100);

// IMPLEMENT
// var d = new Dice(i*150+100, 100);
// d.call('roll');
// var timer = this.game.time.events.add(100, this.rollDiceComplete, this);

// rollDiceComplete: function () {
//     var rollComplete = true;
//     if (d.isAnimationRunning()) {
//         rollComplete = false;
//     }
//     if (rollComplete) {
//         var value = d.value();
//     } else {
//         var timer = this.game.time.events.add(100, this.rollDiceComplete, this);
//     }
// }

// DICE CODE: http://www.netexl.com/blog/phase-dice-roller/
// export default class Dice {
//     constructor(x: number, y: number) {
//         Phaser.Sprite.call(this, mygame, x, y, 'dice');
        
//         this.tween;
//         this.anim;
//         this.blurX = mygame.add.filter("BlurX");  // Blur filters taken from
//         this.blurY = mygame.add.filter("BlurY");  // Filters -> blur example
        
//         this.anchor.setTo(0.5, 0.5);
        
//         var i;
//         var frames = [];
//         for (i=0; i < 15; i++) {
//             frames[i] = mygame.rnd.pick([0,1,2,3,4,5]);
//         }
        
//         // the animation displays the frames from the spritesheet in a random order
//         this.anim = this.animations.add("roll", frames);
//         this.anim.onComplete.add(this.rollComplete, this); 
        
//         this.frame = 1;
        
//         mygame.add.existing(this);
//     }
    
//     Dice.prototype = Object.create(Phaser.Sprite.prototype);
//     Dice.prototype.constructor = Dice;
    
//     Dice.prototype.roll = function() {
//         this.filters = [this.blurX, this.blurY];
//         this.animations.play("roll", 20);
//     };
    
//     Dice.prototype.rollComplete = function() {
//         this.filters = null;
//         this.frame = mygame.rnd.pick([0,1,2,3,4,5]);
//     };
    
//     Dice.prototype.update = function() {
//         if (this.anim.isPlaying) {
//             this.angle = mygame.rnd.angle();
//         }
//     };
    
//     Dice.prototype.isAnimationRunning = function () {
//         return this.anim.isPlaying;
//     };
    
    
//     Dice.prototype.value = function() {
//         switch(this.frame) {
//             case 0:
//             return 1;
//             case 1:
//             return 2;
//             case 2:
//             return 3;
//             case 3:
//             return 4;
//             case 4:
//             return 5;
//             case 5:
//             return 6;
//             default:
//             return null;
//         }
//     };
// }