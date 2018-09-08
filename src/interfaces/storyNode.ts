
export interface StoryNode {

    key: string;

    text: string;

    returnText?: string;

    customReturnText?: ICustomReturnText[];

    choices?: IChoice[];

    onEnter?: IOnEvent[];

    next?: string;
    
}

export interface ICustomReturnText {

    when: IWhen[];

    text: string;

}

export interface IOnEvent {

    when?: IWhen[];

    type: string; 

    key: string;

    value?: string | boolean | number;

    options?: IAudioOption | ITextOptions | IDiceOptions;
}

export interface IChoice {

    text: string;

    color?: string;

    action: IAction;

    when?: IWhen[];

    onAction?: IOnEvent[];

}

export interface IAction {

    type: string;

    target: string;

}

export interface IWhen {

    type: string;

    key: string;

    value: string | boolean;

}

export interface IAudioOption {

    volume?: number;

    loop?: boolean;

    delay?: number;

}

export interface ITextOptions {

    text: string; 

}

export interface IDiceOptions {

    numberOfDice: number;

    action: IDiceOptionAction[];
}

export interface IDiceOptionAction {

    min: number;

    max: number;

    type: string;

    target: string;
    
}