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
        if (this.storyVariables[key]) {
            return this.storyVariables[key];
        }
        return null;
    }

    updateStoryVariable(key, value) {
        this.storyVariables[key] = value;
    }

    checkStoryVariable(key, value) {
        if (this.storyVariables[key] || value === false) {
            if (this.storyVariables[key] === value) {
                return true;
            }
        }
        return false;
    }
}