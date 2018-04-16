import { Signal, create, listen, send } from 'acto'

export function getItem<T> (key: string): T | null {
    try {
        return JSON.parse(localStorage.getItem(key)) as T
    } catch (e) {
        return null
    }
} 

export function setItem<T> (key: string, item: T) {
    localStorage.setItem(key, JSON.stringify(item))
}

// records the last state of a signal
// suitable for stores
export function record<T> (s: Signal<T>, key: string): Signal<T> {
    listen<T>(s, v => {
        setItem<T>(key, v) 
    })
    return s
}

// stores values in a queue when offline and flushes them when back online
// with optional extra queue persistence functions
// suitable for client->server messages
export function offlineQueue<T> (s: Signal<T>, key: string): Signal<T> {

    const s2 = create<T>()
    var queue = getItem<T[]>(key) || []

    if (queue.length === 0) {
        setItem(key, queue)
    }

    function listener (v) {
        if (navigator.onLine) {
            send<T>(s2, v)
        } else {
            queue.push(v)
            setItem(key, queue)
        }
    }

    function flush () {
        for (var i = 0; i < queue.length; i++) {
            send<T>(s2, queue[i])
        }
        queue = []
    }

    function online (evt) {
        queue = getItem<T[]>(key)
        flush()
        setItem(key, queue)
    }

    listen<T>(s, listener)

    window.addEventListener('online', online)

    return s2
}