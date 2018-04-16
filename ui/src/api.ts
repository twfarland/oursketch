import { ajax } from './utils/ajax'
import { send, listen } from 'acto'
import {
    visitorMsg,
    visitorState,
    SetField,
    whiteBoardMsg,
    whiteBoardState,
    SetDrawing,
} from './state'
import { showCanvas } from './canvas'
import {
    Drawing,
    Msg,
    Join,
    Line,
    Welcome,
    PenSetColour,
    PenSetSize,
    PenUp,
    Delete
} from './types'

// ---------- Rest

export function setVisitorField(field: string, value: string) {
    send(visitorMsg, {
        type: 'setField',
        field,
        value
    } as SetField)
}

export function createDrawing(title: string, username: string, email: string, width: number = 800, height: number = 600): Promise<any> {
    return ajax({
        method: 'POST',
        url: '/drawing',
        data: {
            title, username, email, width, height
        }
    })
        .then((drawing: Drawing) => drawing.Code)
}

export function getDrawing(drawingCode: string): Promise<any> {
    return ajax({
        method: 'GET',
        url: '/drawing/' + drawingCode
    })
        .then((drawing: Drawing) => {

            drawing.Lines = drawing.Lines || []

            send(whiteBoardMsg, {
                type: 'setDrawing',
                drawing
            } as SetDrawing)
        })
        .catch((err: Error) => {

            send(whiteBoardMsg, {
                type: 'setError',
                error: 'Failed to get drawing. It may have been deleted.'
            })

            throw err
        })
}

export function loadDrawing(drawingCode, username) {
    getDrawing(drawingCode).then(() => {
        showCanvas()
        initSocket(drawingCode, username)
    })
}

export function loadDrawingHook(params): boolean {

    const drawingCode = params['drawingCode']
    const username = visitorState.value.username

    if (username) {
        loadDrawing(drawingCode, username)
    }

    return true
}

export function saveLine(line: Line): Promise<any> {

    const drawing = whiteBoardState.value.drawing
    if (!drawing) {
        throw new Error('no drawing')
    }

    line.DrawingID = drawing.ID

    return ajax({
        method: 'POST',
        url: '/line',
        data: line
    })
}

export function undo(evt: Event) {

    evt.preventDefault()

    const drawing = whiteBoardState.value.drawing
    const username = visitorState.value.username
    if (!drawing || !username) {
        throw new Error('no drawing / username')
    }

    const myLines = drawing.Lines.filter(l => l.Username === username) || []
    if (myLines.length === 0) { return }

    const prevLine = myLines.sort((a: Line, b: Line) =>
        b.Started - a.Started // newest first
    )[0]

    if (prevLine) {
        sendMsg({ type: 'delete', username, ID: prevLine.Started } as Delete)
    }
}

export function setPenColour(evt: Event) {

    const el = evt.target as HTMLInputElement

    sendMsg({
        type: 'penSetColour',
        username: visitorState.value.username,
        colour: el.value
    } as PenSetColour)
}

export function setPenSize(evt: Event) {

    const el = evt.target as HTMLInputElement

    sendMsg({
        type: 'penSetSize',
        username: visitorState.value.username,
        size: parseInt(el.value, 10)
    } as PenSetSize)
}

// ---------- Web socket

var WS: WebSocket = null

function initSocket(drawingCode: string, username: string, onInit?: Function) {

    const WSUrl = "wss://" + window.location.host + "/ws/" + drawingCode

    if (WS && WS.url !== WSUrl) {
        if (WS.readyState === WS.OPEN) { WS.close() }
        WS = null
    }

    if (!WS) {
        WS = new WebSocket(WSUrl)
        WS.onmessage = onMessage
        WS.onopen = onInit ? (() => { onOpen(); onInit() }) : onOpen
        WS.onerror = onError
    }
}

function joinDrawing() {

    const { username } = visitorState.value
    const { drawing } = whiteBoardState.value

    if (!drawing) { throw new Error('no drawing') }
    if (!username) { throw new Error('no user') }

    sendMsg({ type: 'join', username } as Join)
}

function onMessage(evt: MessageEvent) { // incoming

    const msg = JSON.parse(evt.data) as Msg

    // pre message
    switch (msg.type) {
        case "leave":
            send(whiteBoardMsg, { type: "penUp", username: msg.username, x: 0, y: 0 } as PenUp)
            break
    }

    // send to whiteboard bus
    send(whiteBoardMsg, msg)

    const username = visitorState.value.username
    const pen = whiteBoardState.value.artists[username]

    if (!username || !pen) { return }

    // immediate responses
    switch (msg.type) {
        case "join":
            sendMsg({ type: "welcome", username, to: msg.username, colour: pen.colour, size: pen.size } as Welcome)
            break
    }

    // console.log('socket msg in', msg)
}

function onOpen() {
    joinDrawing()
    console.log('socket opened', WS.url)
}

function onError(err) {
    console.log('socket error', err)
}

// sends to socket, but also directly to the whiteboard message bus
export function sendMsg(msg: Msg) {

    const { username } = visitorState.value
    const { drawing } = whiteBoardState.value

    msg.username = username

    const data = JSON.stringify(msg)

    if (!WS || WS.readyState === WS.CLOSED || WS.readyState === WS.CLOSING) { // reconnect if not open
        initSocket(drawing.Code, username, () => WS.send(data))

    } else {
        WS.send(data)
    }

    send(whiteBoardMsg, msg)

    // console.log('socket msg out', msg)
}

// when going back online, re-load TODO: without actual location reload
window.addEventListener('online', () => window.location.reload())