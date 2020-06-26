import { map, tap, catchError, switchMap, filter } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'
import { of } from 'rxjs'
import SubscribeOnEvent from './SubscribeOnEvent.js'
import { Subscribe } from './StateMngr/Subscribe.js'
import ReactRx from './ReactRx/ReactRx.js'

const PostRequest = ({
    url = 'localhost',
    data = {},
    pipe = [
        map(i => i.response),
        tap(i => console.log(i))
    ]
} = {}) => ajax({
    url: url,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: {...data}
}).pipe(
    ...pipe,
    catchError(error => {
        console.log('error: ', error);
        return rxjs.of(error);
    })
)

const GetRequest = ({
    url = 'localhost',
    pipe = [
        map(i => i.response),
        tap(i => console.log(i))
    ]
} = {}) => ajax({
    url: url,
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
}).pipe(
    ...pipe,
    catchError(error => {
        console.log('error: ', error);
        return rxjs.of(error);
    })
)


const GoRequest = requestFn =>
    ({
        url = 'localhost',
        element = null,
        event = 'click',
        data = {},
        sbsFunc = (() => {}) 
    } = {}) => 
        element ?
            (() => {
                return SubscribeOnEvent({
                    element,
                    event,
                    sbsFunc,
                    pipe: [ switchMap(i => requestFn({url, data})) ]
                })
            })() :
            (() => {
                ReactRx().runOnceOBS({
                    observable: requestFn({url, data}),
                    relayFunc: sbsFunc
                })
            })

const GoGet = GoRequest(GetRequest)

const GoPost = GoRequest(PostRequest)

// const GoGet = ({
//     url = 'localhost',
//     element = null,
//     event = 'click',
//     sbsFunc = (() => {}) 
// } = {}) => 
//     element ?
//         (() => {
//             return SubscribeOnEvent({
//                 element,
//                 event,
//                 sbsFunc,
//                 pipe: [ switchMap(i => GetRequest({url})) ]
//             })
//         })() :
//         (() => {
//             ReactRx().runOnceOBS({
//                 observable: GetRequest({url})
//             })
//         })

const Pipes = {
    filterResponse: ({debug = false} = {}) => [
        map(i => i.response),
        filter(i => i != undefined),
        tap(i => debug && console.log(i)),
    ],
    sideOnResponse: ({status, sideFn}) => [
        tap(i => {
            i.status == status && sideFn(i)
        })
    ]

}
export { PostRequest, GetRequest, GoGet, GoPost, Pipes }