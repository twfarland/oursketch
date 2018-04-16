import { VDom } from 'sprezzatura'
import { _, Div, Form, Fieldset, Label, Input, Select, Button, H3, H4, H5, Ul, Li, A, B, P, Br } from './utils/tags'
import { Visitor, WhiteBoard } from './state'
import { createDrawing, setVisitorField, loadDrawing, setPenColour, setPenSize, undo } from './api'
import history from './utils/history'

function setField (evt: Event) {
    const el = evt.target as HTMLInputElement
    const field = el.getAttribute('name')
    setVisitorField(field, el.value)
}

function submitCreateDrawing (evt: Event) {

    evt.preventDefault()

    const form = evt.target as HTMLFormElement
    const fields = form.getElementsByTagName('input')
    const title = fields['title'].value
    const username = fields['username'].value
    const email = ""

    setVisitorField('username', username)

    createDrawing(title, username, email).then(drawingCode => {
        history.push('#/drawing/' + drawingCode)
    })
}

interface ScreenProps {
    visitor: Visitor;
    whiteBoard?: WhiteBoard;
    params?: {
        [key: string]: string;
    };
}

export function IndexScreen ({ visitor }: ScreenProps): VDom {
    return (
        [Div, { 'class': 'IndexScreen', on: { submit: submitCreateDrawing } }, [
            [Form, { name: 'createDrawing' }, [
                [H4, _, ['New drawing:']],
                [Input, { 
                    type: 'text', 
                    name: 'title', 
                    value: visitor.title, 
                    placeholder: 'Drawing title', 
                    required: true, 
                    on: { change: setField } 
                }],
                [Input, { 
                    type: 'text', 
                    name: 'username', 
                    value: visitor.username, 
                    placeholder: 'Your nickname', 
                    required: true, 
                    on: { change: setField } 
                }],
                [P, _, [
                    'All drawings are public - anyone who knows a drawing link can see it ',
                    'and draw on it. Drawings are deleted after 24 hours, but you can ',
                    'download them before that.'
                ]],
                [Button, { type: 'submit' }, ['create drawing']]
            ]]
        ]]
    )
}

export function DrawingScreen ({ visitor, whiteBoard, params }: ScreenProps): VDom {

    const { artists, drawing } = whiteBoard
    const usernames = Object.keys(artists)
    const userPen = artists[visitor.username]
    const myLines = drawing ? drawing.Lines.filter(l => l.Username === visitor.username) : []

    return (
        [Div, { 'class': 'DrawingScreen' }, [
            
            drawing && 
            userPen ?

            [Div, { 'class': 'DrawingDetails' }, [

                [H4, _, [drawing.Title]],

                [Fieldset, _, [
                    [Label, _, ['Pen colour']],
                    [Input, { 
                        type: 'color', 
                        value: userPen.colour, 
                        on: { change: setPenColour } 
                    }]
                ]],

                [Fieldset, _, [
                    [Label, _, ['Pen size']],
                    [Input, { 
                        type: 'number', 
                        min: 1, 
                        max: 30, 
                        step: 1, 
                        value: userPen.size, 
                        on: { change: setPenSize } 
                    }]
                ]],

                [P, _, [
                    myLines.length > 0 &&
                    [A, { href: "#/undo", on: { click: undo } }, ['Undo']]
                ]],

                [P, _, [
                    'To invite others, copy &amp; send the link in your browser address bar &uarr;'
                ]],

                usernames.length > 0 &&
                [Ul, { 'class': 'DrawingArtists' }, 
                    usernames.map(username =>
                        [Li, _, [
                            username === visitor.username ?
                            [B, _, [username]] :
                            username
                        ]] as VDom
                    )
                ]
            ]] :

            whiteBoard.error ?
            [Div, { 'class': 'error' }, [whiteBoard.error]] :

            [Form, { 
                name: 'joinDrawing', 
                on: { 
                    submit(evt) {
                        evt.preventDefault()
                        loadDrawing(params['drawingCode'], visitor.username)
                    } 
                } 
            }, [
                [H4, _, ['Join drawing']],
                [Input, { 
                    type: 'text', 
                    name: 'username', 
                    value: visitor.username, 
                    placeholder: 'Your nickname', 
                    required: true, 
                    on: { keyup: setField } 
                }],

                visitor.username.length > 0 &&
                [Button, { type: 'submit' }, ['join']]
            ]]
        ]]
    )
}