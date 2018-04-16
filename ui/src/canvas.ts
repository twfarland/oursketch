import { create, send, listen, map, Signal } from 'acto'
import { XY, Line, PenDown, PenMove, PenUp } from './types'
import { whiteBoardMsg, whiteBoardState, WhiteBoard, visitorState } from './state'
import { sendMsg } from './api'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
const WIDTH = canvas.width
const HEIGHT = canvas.height

export function mountCanvas () {

    // render whiteBoard state
    listen(whiteBoardState, renderCanvas)

    // send messages from canvas to socket
    messagesFromCanvas(canvas)
}

export function hideCanvas (): boolean {
    canvas.setAttribute('style', 'display:none;')
    return true
}

export function showCanvas (): boolean {
    canvas.setAttribute('style', '')
    return true
}

function renderCanvas (whiteBoard: WhiteBoard) {

    const { drawing, artists } = whiteBoard
    const lines = drawing && drawing.Lines || []

    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    // render completed lines
    for (var i = 0; i < lines.length; i++) {
        let line = lines[i]
        if (line.Points.length > 0) {
            renderLine(line.Size, line.Colour, line.Points)
        }
    }

    // render lines in progress
    for (var a in artists) {
        let pen = artists[a]
        if (pen.drawing.length > 0) {
            renderLine(pen.size, pen.colour, pen.drawing)
        }
    }
}

function renderLine (size: number, colour: string, points: XY[]) {
    
    ctx.lineWidth = size
    ctx.strokeStyle = colour
    ctx.beginPath()

    for (var i = 0; i < points.length; i++) {
        if (points[i]) {
            let { x, y } = points[i]
            ctx.lineTo(x, y)
        }
    }

    ctx.stroke()
}

function getXY (canvas: HTMLCanvasElement, evt: MouseEvent | Touch): XY {
    const x = evt.pageX - canvas.offsetLeft
    const y = evt.pageY - canvas.offsetTop
    const r = canvas.getBoundingClientRect()
    return { 
        x: scale(x, r.width, canvas.width),
        y: scale(y, r.height, canvas.height)
    }
}

function messagesFromCanvas (canvas: HTMLCanvasElement) {

    var started: number = 0

    function penDown (evt: MouseEvent | Touch) {
        started = Date.now()
        const { x, y } = getXY(canvas, evt)
        sendMsg({ type: 'penDown', x, y, ID: started } as PenDown)
    }

    function penMove (evt: MouseEvent | Touch) {
        if (started > 0) {
            const { x, y } = getXY(canvas, evt)
            sendMsg({ type: 'penMove', x, y, ID: started } as PenMove)
        }
    }

    function penUp (evt: MouseEvent | Touch) {
        const { x, y } = getXY(canvas, evt)
        if (started > 0) {
            sendMsg({ type: 'penUp', x, y, ID: started } as PenUp)
            started = 0
        }
    }

    function touchStart (evt: TouchEvent) {
        evt.preventDefault()
        evt.stopPropagation()
        if (evt.changedTouches.length == 1) {
            penDown(evt.changedTouches[0])
        }
    }

    function touchMove (evt: TouchEvent) {
        evt.preventDefault()
        evt.stopPropagation()
        if (evt.changedTouches.length > 0) {
            penMove(evt.changedTouches[0])
        }
    }

    function touchEnd (evt: TouchEvent) {
        evt.preventDefault()
        evt.stopPropagation()
        if (evt.changedTouches.length > 0) {
            penUp(evt.changedTouches[0])
        }
    }

    canvas.addEventListener("mousedown", penDown)
    canvas.addEventListener("mousemove", penMove)
    canvas.addEventListener("mouseup", penUp)
    canvas.addEventListener("mouseleave", penUp)

    canvas.addEventListener("touchstart", touchStart)
    canvas.addEventListener("touchmove", touchMove)
    canvas.addEventListener("touchend", touchEnd)
    canvas.addEventListener("touchcancel", touchEnd)
}

function scale (n: number, fromN: number, toN: number): number {
    return Math.round(n * toN / fromN)
}
