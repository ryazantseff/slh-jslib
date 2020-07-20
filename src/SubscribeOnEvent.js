import { tap } from 'rxjs/operators'
import { fromEvent } from 'rxjs'

const SubscribeOnEvent = ({
    element = document.body,
    event = 'click',
    pipe = [tap(i => console.log(i))],
    sbsFunc = (() => {}) 
}={}) => fromEvent(element, event)
    .pipe(...pipe)
    .subscribe(sbsFunc)

export default SubscribeOnEvent