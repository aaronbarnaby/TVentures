import * as _ from 'lodash';
import { STORYBOOKS } from "../config";

export default class SaveGame {
    
    gameLog: any;

    currentStory: any;
    currentNodeKey: any;
    currentCharacter: any;
    currentItems: any[];

    storyVariables: any[];

    loadNew(storyKey: string) {
        let storyData = _.find(STORYBOOKS, i => i.Key === storyKey);

        this.currentStory = storyKey;
        this.currentNodeKey = storyData.StartingNode;
        this.currentCharacter = null;
        this.currentItems = [];

        this.gameLog = [];
        this.storyVariables = [];
    }

    reload(data: any) {
        this.currentStory = data.story;
        this.currentNodeKey = data.node;
        this.currentCharacter = data.character;
        this.currentItems = data.items;
        this.gameLog = data.gameLog;
        this.storyVariables = data.storyVariables;
    }

    exportData() {
        let saveExport = {
            story: this.currentStory,
            node: this.currentNodeKey,
            character: this.currentCharacter,
            items: this.currentItems,
            gameLog: this.gameLog,
            storyVariables: this.storyVariables
        };
        return saveExport;
    }
    
    writeToGameLog(decision) {
        this.gameLog.push({ textNodeKey: this.currentNodeKey, decision });
    }

    getStoryVariable(key) {
        let ref = _.find(this.storyVariables, o => o.key === key);
        return (ref) ? ref.value : null;
    }

    updateStoryVariable(key, value) {
        let ref = _.find(this.storyVariables, o => o.key === key);
        if (ref) {
            ref.value = value;
        } else {
            this.storyVariables.push({ key, value });
        }
    }

    checkStoryVariable(key, value) {
        let ref = _.find(this.storyVariables, o => o.key === key);
        if (!ref && value === false) { return true; }
        if (ref) {
            if (ref.value === value) { return true; }
        }
        return false;
    }

    addItems(key, amt) {
        let item = _.find(this.currentItems, o => o.key === key);
        if (item) {
            item.count += amt;
        } else {
            this.currentItems.push({ key, count: amt });
        }
    }

    removeItems(key, amt) {
        let item = _.find(this.currentItems, o => o.key === key);
        if (item) {
            item.count -= amt;
        }
    }

    checkItems(key, amt) {
        let item = _.find(this.currentItems, o => o.key === key);
        if (!item || amt === 0) { return false; }

        return (item.count >= amt);
    }
}