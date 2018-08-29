import { STORYBOOKS, STORY } from '../config';

declare function require(name:string);

export default class TextManager {

    loadStory(storyNumber) {
        console.log(`%c Loading story ${storyNumber}`, 'color:white; background:orange;');
    
        if (storyNumber === STORYBOOKS.TWIN_TERROR) {
            this.loadJSON(require('../stories/twin_terror.json'));
        }
    }

    loadJSON(json) {
        STORY.storyData = json;
        STORY.LoadedFlag = true;
    }
}