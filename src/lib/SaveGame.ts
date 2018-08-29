import { CONFIG, STORYBOOKS } from "../config";

export default class SaveGame {
    
    playerPower: number;
    playerKarma: number;
    playerIntellect: number;
    playerLove: number;
    
    currentStory: any;
    currentNodeKey: any;
    
    gameLog: any;
    gameVariables: any;
    
    constructor() {
        this.playerPower = 0;
        this.playerKarma = 0;
        this.playerIntellect = 0;
        this.playerLove = 0;
        
        if (CONFIG.debugMode) {
            this.playerPower = 1000;
            this.playerKarma = 1000;
            this.playerIntellect = 1000;
            this.playerLove = 1000;
        }

        this.currentStory = STORYBOOKS.TWIN_TERROR;
        this.currentNodeKey = 'TT0';
        
        this.gameLog = [];
        
        this.gameVariables = {};
    }

    loadSave(story, nodeKey, power, karma, intelect, love) {
        // @TODO
    }
    
    writeToGameLog(textNodeKey, decision) {
        this.gameLog.push({ textNodeKey, decision });
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