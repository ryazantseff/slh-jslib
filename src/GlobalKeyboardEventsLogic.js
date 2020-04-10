import { combineLatest } from 'rxjs'
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
            relayObs = [rxjs.of(undefined)], //[]
            relayFunc = () => {console.log('def')},
            subsFunc = () => {}
        } = {}) => {
            const $combine = combineLatest(...relayObs)
            keyStreamElementFocusFilter.pipe(
                // rxjs.operators.tap(i => console.log(i)),
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