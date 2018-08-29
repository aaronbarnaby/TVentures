import StoryNode from "./storyNode";
import SaveGame from "../lib/SaveGame";
import TextManager from "../lib/TextManager";

export default interface IStory {
    
    LoadedFlag: boolean;

    storyData: [StoryNode];

    currentSaveGame: SaveGame;

    mainTextManager: TextManager;
}