import ChoiceData from "./choiceData";

export default interface StoryNode {

    KEY: string;

    TEXT: string;

    ONENTER: string;

    CHOICES: [ChoiceData];

    NEXT: string;
    
}