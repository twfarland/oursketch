interface Listener {
    (path: string): void;
}

export class History {

    listeners: Listener[] = []

    constructor() {
        window.addEventListener('hashchange', () => {
            const path = this.getHashPath()
            for (let listener of this.listeners) {
                listener(path)
            }
        })
    }

    listen(listener: Listener): void {
        this.listeners.push(listener)
    }  

    replace(path: string): void {
        const hashIndex = window.location.href.indexOf('#')
        window.location.replace(
            window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path
        )
    }

    push(path: string): void {
        window.location.hash = path
    }

    private getHashPath (): string {
        const href = window.location.href
        const hashIndex = href.indexOf('#')
        return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
    }
}

export default new History()

