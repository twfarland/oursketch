import { extend, toArray } from './object'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'

type Headers = {
    [header: string]: string;
}

export interface AjaxOptions {
    method:      HttpMethod;
    url:         string;
    data?:       any;
    headers?:    Headers;
}

const baseHeaders: Headers = {
    'Accept':           '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type':     'application/json;charset=UTF-8'
}

function makeParam (value: any): string {
    return typeof value === 'object' ? JSON.stringify(value): value
}

function makeParams (data: Object): string {
    return '?' + toArray(data, (k, v) => k + '=' + makeParam(v)).join('&')
}

export function ajax<T> (options: AjaxOptions): Promise<T> {

    /*
    if (!navigator.onLine) {
        return Promise.reject({ 
            error: 'Not online'
        })
    }
    */

    return new Promise((resolve, reject) => {
        
        const { method, url, data, headers } = options

        const headers_ = headers ? extend(baseHeaders, headers) : baseHeaders
        const data_: string = data && method !== 'GET' ? JSON.stringify(data) : ''
        const params: string = method === 'GET' ? makeParams(data): ''

        const req = new XMLHttpRequest()

        req.onreadystatechange = () => {
            
            if (req.readyState !== 4) { return }
            if (req.status === 0) { 
                return reject({ error: 'Unsent' })
            }

            try {
                const json = JSON.parse(req.responseText)
                if (req.status < 400) {
                    resolve(json)
                } else {
                    reject(json)
                }
            } catch (parseError) {
                reject({ error: parseError.message })   
            }
            
            return true
        }

        req.open(method, url + params, true)

        for (let header in headers_) {
            req.setRequestHeader(header, headers_[header])
        }

        req.send(data_)
    })
}
