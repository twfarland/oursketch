
interface Mapper {
    (k: string, v: any): any;
}

export function extend (obj1, obj2) {
    const res = {}
    for (let p in obj1) {
        res[p] = obj1[p]
    }
    for (let p in obj2) {
        res[p] = obj2[p]
    }
    return res
}

export function set (obj1, obj2) {
    for (let p in obj2) {
        if (typeof obj2[p] !== 'undefined') {
            obj1[p] = obj2[p]
        }
    }
}

export function map (obj, f) {
    const res = {}
    for (let p in obj) {
        res[p] = f(obj[p], p)
    }
    return res
}

export function toArray (obj, mapper: Mapper): any[] {
    const res = []
    for (let p in obj) {
        res.push(mapper(p, obj[p]))
    }
    return res
}

export function shallowEqual (obj1, obj2): boolean {
    for (let p in obj1) {
        if (obj1[p] !== obj2[p]) { return false }
    }
    for (let p in obj2) {
        if (obj1[p] !== obj2[p]) { return false }
    }
    return true
} 

export function without (obj, key) {
    const res = {}
    for (let p in obj) {
        if (key !== p) {
            res[p] = obj[p]
        }
    }
    return res
}