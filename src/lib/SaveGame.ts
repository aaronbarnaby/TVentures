import * as _ from 'lodash';
import { STORYBOOKS } from "../config";

export default class SaveGame {
    
    currentStory: any;
    currentNodeKey: any;
    currentCharacter: any;
    
    gameLog: any;
    gameVariables: any;

    loadNew(storyKey: string) {
        let storyData = _.find(STORYBOOKS, i => i.Key === storyKey);

        this.currentStory = storyKey;
        this.currentNodeKey = storyData.StartingNode;
        this.currentCharacter = null;

        this.gameLog = [];
        this.gameVariables = [];
    }

    reload(data: any) {
        this.currentStory = data.story;
        this.currentNodeKey = data.node;
        this.currentCharacter = data.character;
        this.gameLog = data.gameLog;
        this.gameVariables = data.gameVariables;
    }

    exportData() {
        let saveExport = {
            story: this.currentStory,
            node: this.currentNodeKey,
            character: this.currentCharacter,
            gameLog: this.gameLog,
            gameVariables: this.gameVariables
        };
        return saveExport;
    }
    
    writeToGameLog(decision) {
        this.gameLog.push({ textNodeKey: this.currentNodeKey, decision });
    }
    
    writeToGameVariables(reference, value) {
        if (this.gameVariables.has(reference)) {
            let original = this.gameVariables.get(reference);
            this.gameVariables.set(reference, original + value);
        } else {
            this.gameVariables.set(reference, value);
        }
    }
    
    checkGameVariables(reference, equivalence, value) {
        // search for reference and value pair in gameVariables data structure
        // if found, checks for whether it's >, <, etc. to the value provided
        // if it doesn't pass the test to the value, or if not found, it returns false
        
        var defaultValue = 0;
        
        if (equivalence === '' || equivalence === null || equivalence === undefined) {
            // just search for whether the additional variable is present - value doesn't matter
            return (this.gameVariables.has(reference));
        } else if (equivalence === '=') {
            // check for presence of variable and value
            return (this.gameVariables.get(reference) === value);
        } else if (equivalence === '!=' && (value === '' || value === null || value === undefined)) {
            // checks for if the additional variable is present at all, and returns false if present, true if not - opposite of first check in this series. e.g. if !(01JennethDead), then returns true.
            return !(this.gameVariables.has(reference));
        } else if (equivalence === '!=' && !(value === '' || value === null || value === undefined)) {
            if (this.gameVariables.has(reference) && this.gameVariables.get(reference) !== value) {
                return true;
            } else if (value !== defaultValue) {
                // variable not found, so assume default value (0)
                return true;
            } else {
                return false;
            }
        } else if (equivalence === '<') {
            if (this.gameVariables.has(reference) && this.gameVariables.get(reference) < value) {
                return true;
            } else if (value < defaultValue) {
                // variable not found, so assume default value (0)
                return true;
            } else {
                return false;
            }
        } else if (equivalence === '<=') {
            if (this.gameVariables.has(reference) && this.gameVariables.get(reference) <= value) {
                return true;
            } else if (value <= defaultValue) {
                // variable not found, so assume default value (0)
                return true;
            } else {
                return false;
            }
        } else if (equivalence === '>') {
            if (this.gameVariables.has(reference) && this.gameVariables.get(reference) > value) {
                return true;
            } else if (value > defaultValue) {
                // variable not found, so assume default value (0)
                return true;
            } else {
                return false;
            }
        } else if (equivalence === '>=') {
            if (this.gameVariables.has(reference) && this.gameVariables.get(reference) >= value) {
                return true;
            } else if (value >= defaultValue) {
                // variable not found, so assume default value (0)
                return true;
            } else {
                return false;
            }
        } else {
            // in case anything goes wrong, defaults to returning false
            console.log('%c checkGameVariables() error ', 'color:white; background:red;');
            return false;
        }
    }
}