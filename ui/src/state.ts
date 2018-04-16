import { XY, Drawing, Line, Msg, PenUp, Nil } from './types'
import { setItem, getItem } from './utils/persist'
import { extend, without } from './utils/object'
import * as simplify from 'simplify-js'
import { create, listen, fold } from 'acto'
import { saveLine } from './api'

export interface NoOp { type: 'NoOp' }

// ---------- Visitor

export interface Visitor {
    title: string;
    username: string;
    email: string;
}

export const initialVisitor: Visitor = {
    title: "",
    username: "",
    email: ""
}

export interface SetField { type: 'setField', field: string, value: string } 
export type VisitorMsg = SetField | Nil

export function visitorReducer (msg: VisitorMsg, state: Visitor): Visitor {

    switch (msg.type) {
        case 'setField':
            return extend(state, { [msg.field]: msg.value }) as Visitor

        default:
            return state
    }
}

export const visitorMsg = create<VisitorMsg>({ type: 'nil' })
export const visitorState = fold(visitorReducer, getItem('visitor') || initialVisitor, visitorMsg)

listen(visitorState, v => setItem('visitor', v))

// ---------- WhiteBoard

const defaultSize = 3;
const defaultColour = '#000000';

interface Pen {
    down: boolean;
    colour: string;
    size: number;
    drawing: XY[];
}

interface Artists {
    [userName: string]: Pen;
}

export interface WhiteBoard {
    error?: string;
    drawing?: Drawing;
    artists: Artists; // users and their actions in progress
}

export const initialWhiteBoard: WhiteBoard = {
    error: null,
    drawing: null,
    artists: {}
}

export interface SetDrawing { type: 'setDrawing', drawing: Drawing }
export interface SetError { type: 'setError', error: string }
export type WhiteBoardMsg = SetDrawing | SetError | Msg 

export function whiteBoardReducer (msg: WhiteBoardMsg, state: WhiteBoard): WhiteBoard {

    const { error, drawing, artists } = state

    switch (msg.type) {

        case 'setError':
            return { error: msg.error, drawing, artists }

        case 'setDrawing':
            return { drawing: msg.drawing, artists }

        case 'join':
            return { 
                drawing,
                artists: extend(artists, {
                    [msg.username]: basePen()
                })
            }

        case 'leave':
            return { drawing, artists: without(artists, msg.username) }

        case 'welcome':
            return { 
                drawing, 
                artists: extend(artists, {
                    [msg.username]: {
                        down: false,
                        colour: msg.colour,
                        size: msg.size, 
                        drawing: []
                    } as Pen
                }) 
            }

        case 'penSetColour':
            return { 
                drawing, 
                artists: extend(artists, {
                    [msg.username]: extend(artists[msg.username], {
                        colour: msg.colour
                    })
                })
            }
            
        case 'penSetSize':
            return { 
                drawing, 
                artists: extend(artists, {
                    [msg.username]: extend(artists[msg.username], {
                        size: msg.size
                    })
                })
            }  
            
        case 'penDown':
            return { 
                drawing, 
                artists: extend(artists, {
                    [msg.username]: extend(artists[msg.username], {
                        down: true,
                        drawing: [{ x: msg.x, y: msg.y }]
                    })
                })
            }
        
        case 'penMove':
            if (!artists[msg.username].down) { return state }
            return { 
                drawing, 
                artists: extend(artists, {
                    [msg.username]: extend(artists[msg.username], {
                        drawing: artists[msg.username].drawing.concat([{ x: msg.x, y: msg.y }])
                    })
                })
            }

        case 'penUp':
            let pen = artists[msg.username]
            if (!pen.down) { return state }
            return { 
                drawing: extend(drawing, {
                    Lines: pen.drawing.length === 0 ? 
                        drawing.Lines : 
                        drawing.Lines.concat([penToLine(msg, pen)]), 
                }) as Drawing,
                artists: extend(artists, {
                    [msg.username]: extend(pen, {
                        down: false,
                        drawing: []
                    })
                })
            }

        case 'delete':
            return {
                artists,
                drawing: extend(drawing, {
                    Lines: drawing.Lines.filter(l =>
                        !(l.Started === msg.ID && l.Username === msg.username)
                    )
                }) as Drawing
            }

        default:
            return state
    }
}

function penToLine (msg: PenUp, pen: Pen): Line {

    const line = {
        Username: msg.username,
        Points: simplify(pen.drawing, 2),
        Colour: pen.colour,
        Size: pen.size,
        Started: msg.ID
    }

    saveLine(line)

    return line
} 

function basePen (): Pen {
    return {
        down: false,
        colour: defaultColour,
        size: defaultSize,
        drawing: []
    }
}

export const whiteBoardMsg = create<WhiteBoardMsg>({ type: 'nil' })
export const whiteBoardState = fold(whiteBoardReducer, initialWhiteBoard, whiteBoardMsg)