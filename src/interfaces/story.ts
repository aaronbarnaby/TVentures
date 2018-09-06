import TextManager from "../lib/TextManager";
import { StoryNode } from "./storyNode";

export default interface IStory {
    
    LoadedFlag: boolean;

    startingNode: string;

    storyData: StoryNode[];

    charactors: any[];

    textManager: TextManager;
}