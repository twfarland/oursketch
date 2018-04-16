import { updateDom, VDom, VDomView } from 'sprezzatura'
import { Signal, listen, unlisten } from 'acto'
import { shallowEqual } from './object'
import { History } from './history'

type Params = {
    [key: string]: string;
}

interface Hook {
    (p?: Params): boolean;
}

export interface Route {
    route:      string;
    view?:      VDomView;
    onEnter?:   Hook[];
    onLeave?:   Hook[];
    redirect?:  string;
    connect?:   { 
        [state: string]: Signal<any> 
    };
}

export interface RouterConfig {
    mount:      Node;
    history:    History;
    routes:     Route[];
}

export interface Matched {
    route:      Route;
    params:     Params;
}

export default function router (config: RouterConfig) {

    const { mount, history, routes } = config

    var matched: Matched
    var dom: Node   = document.createElement('div')
    var vDom: VDom  = ['div', {}, []]

    function render () {

        const connect = matched.route.connect

        const data = {
            params: matched.params
        } 

        if (connect) {
            for (let state in connect) {
                data[state] = connect[state].value
            }
        }
        
        const nextVDom = matched.route.view(data)
        updateDom(vDom, nextVDom, dom, mount)
        vDom = nextVDom
    }

    function shouldReRoute (matched_: Matched): boolean {
        return !matched || // no current route
        (matched_ && matched && 
            ((matched_.route !== matched.route) || // different route
            !shallowEqual(matched_.params, matched.params))) // same route, different params
    }

    function changeRoute (path = '/') {

        const matched_: Matched = getRoute(path, routes)

        if (matched_ && shouldReRoute(matched_)) {

            // leave current route
            if (matched) {

                // disconnect old signals 
                if (matched.route.connect) {
                    for (let state in matched.route.connect) {
                        unlisten(matched.route.connect[state], render)
                    }
                }

                 // fire onLeave hooks
                if (matched.route.onLeave) { 
                    fireAll(matched.route.onLeave, matched.params) 
                }
            }

            // change the current route
            matched = matched_ 

            // redirect
            if (matched.route.redirect) {
                history.replace(matched.route.redirect)
 
            } else if (matched) { // enter new route

                // connect new signals - render when receiving a new value
                if (matched.route.connect) {
                    for (let state in matched.route.connect) {
                        listen(matched.route.connect[state], render)
                    }
                }

                // fire onEnter hooks
                if (matched.route.onEnter) { 
                    fireAll(matched.route.onEnter, matched.params) 
                }

                // whenever we change route, we also update the dom
                render()
            }
        }
    }

    history.listen(changeRoute)

    changeRoute(window.location.hash.split('#')[1])

    mount.appendChild(dom)
}

// fire each callback in sequence, if one returns false, none subsequent will fire
function fireAll (callbacks: Hook[], params: Params) {
    for (let c of callbacks) { 
        if (!c(params)) { return } 
    }
}

function splitPath (pathname: string): string[] {
    return pathname.split('/').filter(p => p.length > 0)
}

function matchRoute (path: string[], route: string[]) {

    const params = {}
    var i
    var r
    var p   

    if (route.length !== path.length) return false

    for (i = 0; i < route.length; i++) {

        r = route[i]
        p = path[i]

        if (r.charAt(0) === ':') {
            params[r.substr(1)] = p

        } else if (r !== p) {
            return null
        }
    }    
    return params
} 

function getRoute (pathname: string, routes: Route[]): Matched {

    const path = splitPath(pathname)
    var route
    var params

    for (route of routes) {
        params = matchRoute(path, splitPath(route.route))
        if (params) { 
            return { route, params }
        }
    }
}
