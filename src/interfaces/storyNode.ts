import ChoiceData from "./choiceData";

export default interface StoryNode {

    KEY: string;

    TEXT: string;

    ONENTER: any;

    CHOICES: [ChoiceData];

    NEXT: string;
    
}