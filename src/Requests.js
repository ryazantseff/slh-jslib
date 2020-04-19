import { map, tap, catchError, switchMap } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'
import { of } from 'rxjs'
import SubscribeOnEvent from './SubscribeOnEvent.js'
import { Subscribe } from './StateMngr/Subscribe.js'

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

const GoGet = ({
    url = 'localhost',
    element = null,
    event = 'click',
    sbsFunc = (() => {}) 
} = {}) => 
    element ?
        (() => {
            return SubscribeOnEvent({
                element,
                event,
                sbsFunc,
                pipe: [ switchMap(i => GetRequest({url})) ]
            })
        })() :
        (() => {})()


export { PostRequest, GetRequest, GoGet }