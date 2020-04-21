import { webSocket } from "rxjs/webSocket"
import { BehaviorSubject, combineLatest, of, merge } from 'rxjs'
import { withLatestFrom, tap, catchError, map } from 'rxjs/operators'

const WebSocketMsg = ({
    wsurl = `ws://${document.domain}:${location.port}/ws`,
    config = {}
} = {}) => {
    
    const mockObj = {
        'mutateFn': msg => {return msg},
        'msgStream': new BehaviorSubject([]),
        'logLength': 25
    }

    Object.keys(config).forEach(key => {
        config[key]['mutateFn'] = ('mutateFn' in config[key]) ? config[key]['mutateFn'] : mockObj['mutateFn']
        config[key]['msgStream'] = ('msgStream' in config[key]) ? config[key]['msgStream'] : new BehaviorSubject([])
        config[key]['logLength'] = ('logLength' in config[key]) ? config[key]['logLength'] : mockObj['logLength']

    })

    const $combined = combineLatest(...Object.keys(config).map(key => config[key]['msgStream']))
    
    const $ws = webSocket(wsurl).pipe(
        withLatestFrom($combined),
        tap(([msg, combined]) => {
            combined[-1] = [];
            const separatedStream = combined[Object.keys(config).findIndex(key => key == msg.name)];

            msg = (config[msg.name] || mockObj)['mutateFn'](msg);
            (config[msg.name] || mockObj)['msgStream']
                .next([msg, ...separatedStream.slice(0, (config[msg.name] || mockObj)['logLength'])])
        }),
        catchError(error => {
            console.log('error: ', error);
            return rxjs.of(error);
        })
    ).subscribe()
    
    return Object.keys(config).reduce((acc, key) => {
        acc[key] = config[key]['msgStream'] ?
            config[key]['msgStream'] :
            mockObj['msgStream']
        return acc
    }, {'_unsorted_': mockObj['msgStream']})

}

const CombineStreams = ({
    streams = [of({})],
    logLength = 25
} = {}) => {
    const mergedBuff = new BehaviorSubject([])
    const combinedStreams = merge(...streams).pipe(
        withLatestFrom(mergedBuff),
        map(([msg, buff]) => [msg[0], ...buff].slice(0, logLength)),
        tap(i => mergedBuff.next(i))
    )
    return combinedStreams
}

export { WebSocketMsg, CombineStreams }