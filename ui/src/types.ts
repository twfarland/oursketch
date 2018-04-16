
// ---------- Stored entities ----------

export interface Drawing {
    ID: number;
    Code: string;
    Title: string;
    Username: string;
    Email: string;
    Width: number;
    Height: number;
    Lines: Line[];
    Created?: string;
}

export interface Line {
    DrawingID?: number;
    Username: string;
    Points: XY[];
    Colour: string;
    Size: number;
    Started: number;
    Created?: string;
}

export interface XY { 
    x: number
    y: number 
}

// ---------- Messages ----------

export interface BaseMsg {
    type: string; 
    username?: string;
}

export interface Nil extends BaseMsg {
    type: 'nil';
}

export interface Join extends BaseMsg { 
    type: 'join';
    username: string;
}

export interface Leave extends BaseMsg { 
    type: 'leave';
    username: string;
}

export interface Welcome extends BaseMsg { 
    type: 'welcome';
    username: string;
    to: string;
    colour: string;
    size: number;
}

export interface PenSetColour extends BaseMsg { 
    type: 'penSetColour';
    username: string;
    colour: string;
}

export interface PenSetSize extends BaseMsg { 
    type: 'penSetSize';
    username: string;
    size: number;
}

export interface PenDown extends BaseMsg { 
    type: 'penDown';
    username: string; 
    x: number;
    y: number;
    ID: number; // for pen moves, ID is the Date.now() when it was started
}

export interface PenMove extends BaseMsg { 
    type: 'penMove';
    username: string; 
    x: number;
    y: number;
    ID: number;
}

export interface PenUp extends BaseMsg { 
    type: 'penUp';
    username: string; 
    x: number;
    y: number;
    ID: number;
}

export interface Delete extends BaseMsg {
    type: 'delete';
    username: string;
    ID: number; // the line started time, not actual line ID
}

export type Msg 
    = Nil 
    | Join 
    | Leave 
    | Welcome
    | PenSetColour
    | PenSetSize 
    | PenDown
    | PenMove
    | PenUp 
    | Delete
