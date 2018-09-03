import * as Phaser from 'phaser-ce';

import { CONFIG } from './config';
import { SplashState, MenuState, StoryState, StoryLoadingState, BootState } from './states';

class Game extends Phaser.Game {
	constructor() {
		Phaser.Component.Core.skipTypeChecks = true;

		const docElement = document.documentElement;
		const width = docElement.clientWidth > CONFIG.gameWidth ? CONFIG.gameWidth : docElement.clientWidth;
		const height = docElement.clientHeight > CONFIG.gameHeight ? CONFIG.gameHeight : docElement.clientHeight;

		super(width, height, Phaser.AUTO, 'content', null);

		this.state.add('Boot', BootState, true);
		this.state.add('Splash', SplashState, false);
		this.state.add('Menu', MenuState, false);

		// Bonus Game
		//this.state.add('BonusLoading', BonusLoadingState, false);
		//this.state.add('BonusGame', BonusGameState, false);

		// Story
		this.state.add('StoryLoading', StoryLoadingState, false);
		this.state.add('Story', StoryState, false);
	}
}

new Game();