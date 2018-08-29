import * as Phaser from 'phaser-ce';

import { CONFIG } from './config';
import { SplashState, MenuState, StoryState, StoryLoadingState } from './states';

class Game extends Phaser.Game {

	constructor() {
		const docElement = document.documentElement;
		const width = docElement.clientWidth > CONFIG.gameWidth ? CONFIG.gameWidth : docElement.clientWidth;
		const height = docElement.clientHeight > CONFIG.gameHeight ? CONFIG.gameHeight : docElement.clientHeight;

		super(width, height, Phaser.AUTO, 'content', null);

		this.state.add('Spash', SplashState, true);
		this.state.add('Menu', MenuState, false);
		this.state.add('StoryLoading', StoryLoadingState, false);
		this.state.add('Story', StoryState, false);
	}
}

new Game();