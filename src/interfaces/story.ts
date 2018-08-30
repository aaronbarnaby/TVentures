import StoryNode from "./storyNode";
import TextManager from "../lib/TextManager";

export default interface IStory {
    
    LoadedFlag: boolean;

    startingNode: string;

    storyData: [StoryNode];

    charactors: [any];

    textManager: TextManager;
}