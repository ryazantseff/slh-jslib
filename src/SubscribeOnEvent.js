import { tap } from 'rxjs/operators'

const SubscribeOnEvent = ({
    element = document.body,
    event = 'click',
    pipe = [tap(i => console.log(i))],
    sbsFunc = (() => {}) 
}={}) => rxjs.fromEvent(element, event)
    .pipe(...pipe)
    .subscribe(sbsFunc)

export default SubscribeOnEvent