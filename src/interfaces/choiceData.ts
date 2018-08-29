
export default interface ChoiceData {

    TEXT: string;

    COLOR: ChoiceColor;

    REQUIRED_TYPE: ChoiceTypes;

    REQUIRED_QTY: number;

    ACTION: ChoiceActions;

    NEXT: string;

}

enum ChoiceColor {
    red = "red",
}

enum ChoiceTypes {
    power = "power",
    intellect = "intellect",
    karma = "karma",
    love = "love",
}

enum ChoiceActions {
    next = "next"
}