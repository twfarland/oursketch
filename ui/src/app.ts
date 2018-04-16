import { visitorState, whiteBoardState } from './state'
import { IndexScreen, DrawingScreen } from './views'
import { mountCanvas, hideCanvas, showCanvas } from './canvas'
import { loadDrawingHook } from './api'
import router from './utils/router'
import history from './utils/history'
import './app.css'

// controls

const routes = [
    { 
        route: '/', 
        view: IndexScreen, 
        connect: { visitor: visitorState },
        onEnter: [hideCanvas]
    },
    { 
        route: '/drawing/:drawingCode',
        view: DrawingScreen, 
        connect: { visitor: visitorState, whiteBoard: whiteBoardState },
        onEnter: [hideCanvas, loadDrawingHook]
    }
]

router({
    mount: document.getElementById('ctrls'),
    history,
    routes
})

// canvas

mountCanvas()

// no support

if (!WebSocket) {
    alert("Your browser is not supported. Try Chrome or Firefox.")
}
