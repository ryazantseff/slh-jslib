import { map, tap, catchError, switchMap, filter } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'
import { of } from 'rxjs'
import SubscribeOnEvent from './SubscribeOnEvent.js'
import { Subscribe } from './StateMngr/Subscribe.js'
import ReactRx from './ReactRx/ReactRx.js'

const Request = ({
    url = 'localhost',
    pipe = [
        map(i => i.response),
        tap(i => console.log(i))
    ],
    headers = {},
    data = {},
    method = 'GET',
    errorCallback = error => console.log('error: ', error)
} = {}) => ajax({
        url: url,
        method: method,
        headers: {'Content-Type': 'application/json', ...headers},
        body: {...data}
    }).pipe(
        ...pipe,
        catchError(error => {
            // console.log('error: ', error);
            errorCallback(error)
            return of(error);
        })
    )

const PostRequest = (props = {}) => Request({method: 'POST', ...props})
const GetRequest = (props = {}) => Request({method: 'GET', ...props})

const GoRequest = requestFn =>
    ({
        url = 'localhost',
        element = null,
        event = 'click',
        data = {},
        headers = {},
        sbsFunc = (() => {}) 
    } = {}) => 
        element ?
            (() => {
                return SubscribeOnEvent({
                    element,
                    event,
                    sbsFunc,
                    pipe: [ switchMap(i => requestFn({url, data, headers})) ]
                })
            })() :
            (() => {
                ReactRx().runOnceOBS({
                    observable: requestFn({url, data, headers}),
                    relayFunc: sbsFunc
                })
            })

const GoGet = GoRequest(GetRequest)

const GoPost = GoRequest(PostRequest)

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