
export interface StoryNode {

    key: string;

    text: string;

    returnText: string;

    customReturnText: ICustomReturnText[];

    choices: IChoice[];

    onEnter: IOnEvent[];

    next: string;
    
}

export interface ICustomReturnText {

    when: IWhen;

    text: string;

}

export interface IOnEvent {

    when: IWhen[];

    type: string; 

    key: string;

    value: string;

    options: IAudioOption | ITextOptions;
}

export interface IChoice {

    text: string;

    color: string;

    action: IAction;

    when: IWhen[];

    onAction: IOnEvent[];

}

export interface IAction {

    type: string;

    target: string;

}

export interface IWhen {

    type: string;

    key: string;

    value: string;

}

export interface IAudioOption {

    volumne: number;

    loop: boolean;

    delay: number;
}

export interface ITextOptions {

    text: string; 
}