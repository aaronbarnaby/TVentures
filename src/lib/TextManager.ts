import * as _ from 'lodash';
import { STORYBOOKS } from '../config';
import { Globals } from '../globals';

declare function require(name:string);

export default class TextManager {

    loadStory(storyKey: string) {
        let storyBook = _.find(STORYBOOKS, i => i.Key === storyKey);

        console.log(`%c Loading story ${storyBook.Name}`, 'color:white; background:orange;');

        if (storyKey === "TWIN_TERROR") {
            this.loadJSON(require("../stories/twin_terror.json"), require("../stories/twin_terror_charactors.json"), storyBook.StartingNode);
        }
    }

    loadJSON(json, charactorsJson, startingNode) {
        Globals.activeStory.storyData = json;
        Globals.activeStory.charactors = charactorsJson;
        Globals.activeStory.startingNode = startingNode;
        Globals.activeStory.LoadedFlag = true;
    }
}