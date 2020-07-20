import { combineLatest, of } from 'rxjs'
import { filter, withLatestFrom, tap } from 'rxjs/operators'

const GlobalKeyboardEventsLogic = keyDownEventStream =>
    ({
        element = undefined,
    } = {}) => {
    const keyStreamElementFocusFilter = keyDownEventStream.pipe(
        filter(i => 
            element !== undefined ?
                i.target === element :
                true    
        ),
    )

    const subs = 
        ({
            keyName = 'Enter',
            relayObs = [of(undefined)], //[]
            relayFunc = () => {console.log('def')},
            subsFunc = () => {}
        } = {}) => {
            const $combine = combineLatest(...relayObs)
            keyStreamElementFocusFilter.pipe(
                withLatestFrom($combine),
                tap(([key, combine]) => {
                    key.key == keyName && relayFunc(combine)
                })
            ).subscribe(subsFunc) 
        }
    return {
        subscribe: subs
    }
}

export default GlobalKeyboardEventsLogic