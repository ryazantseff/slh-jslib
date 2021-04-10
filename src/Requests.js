import { map, tap, catchError, switchMap, filter } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'
import { of, merge } from 'rxjs'
import SubscribeOnEvent from './SubscribeOnEvent.js'
import { Subscribe } from './StateMngr/Subscribe.js'
import ReactRx from './ReactRx/ReactRx.js'

const Request = ({
    url = 'localhost',
    pipe = [
        map(i => i.response),
        // tap(i => console.log(i))
    ],
    headers = {},
    data = null,
    method = 'GET',
    errorCallback = error => console.log('error: ', error)
} = {}) => merge(
    of({status: 'pending' }),
    ajax({
        url: url,
        method: method,
        headers: {'Content-Type': 'application/json', ...headers},
        body: {...data}
    }).pipe(
        ...pipe
    )
).pipe(
    catchError(error => {
        console.log('error: ', error);
        errorCallback(error)
        return of(error);
    })
)

const PostRequest = (props = {}) => Request({method: 'POST', ...props})
const GetRequest = (props = {}) => Request({method: 'GET', ...props})
const PutRequest = (props = {}) => Request({method: 'PUT', ...props})
const DelRequest = (props = {}) => Request({method: 'DELETE', ...props})

const GoRequest = (requestFn) =>
    ({
        url = 'localhost',
        element = null,
        event = 'click',
        data = null,
        headers = {},
        sbsFunc = (() => {}) ,
        errorCallback = (() => {}),
        pipe = []
    } = {}) => 
        element ?
            (() => {
                return SubscribeOnEvent({
                    element,
                    event,
                    sbsFunc,
                    pipe: [ switchMap(i => requestFn({url, data, headers, errorCallback, pipe})) ]
                })
            })() :
            (() => {
                ReactRx().runOnceOBS({
                    observable: requestFn({url, data, headers, errorCallback, pipe}),
                    relayFunc: sbsFunc
                })
            })

const GoGet = GoRequest(GetRequest)
const GoPost = GoRequest(PostRequest)
const GoPut = GoRequest(PutRequest)
const GoDel = GoRequest(DelRequest)

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

const useRequest = method => ({
    url = 'http://localhost',
    data = null,
    defaultValue = {},
    mapFn = i => i?.response
} = {}) => ReactRx().useOBS({
    observable: Request({url, method, pipe: [map(mapFn)]}),
    defaultValue
})

const usePost = useRequest('POST')
const useGet = useRequest('GET')
const usePut = useRequest('PUT')
const useDel = useRequest('DELETE')

export {
    Request,
    PostRequest,
    GetRequest,
    GoGet,
    GoPost,
    GoDel,
    GoPut,
    Pipes,
    usePost,
    useGet,
    usePut,
    useDel
}