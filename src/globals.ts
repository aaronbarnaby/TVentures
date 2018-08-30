import SaveGame from "./lib/SaveGame";
import IStory from "./interfaces/story";
import TextManager from "./lib/TextManager";
import SaveManager from "./lib/SaveManager";

export let Globals: IGlobals = {
    game: null,
    save: null,
    saveManager: new SaveManager(),
    activeStory: {
        LoadedFlag: false,
        startingNode: null,
        storyData: null,
        charactors: null,
        textManager: new TextManager()
    },
};

interface IGlobals {
    
    game: Phaser.Game;
    
    save: SaveGame;

    saveManager: SaveManager;

    activeStory: IStory;
    
}