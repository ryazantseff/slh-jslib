import { fromEvent, BehaviorSubject } from 'rxjs'

const ElementFocusBS = (element, {onFocusPipe = [], onBlurPipe = []} = {}) => {
    const $elementFocusBS = new BehaviorSubject(
        document.hasFocus() && document.activeElement === element
    )
    const $elementFocus = fromEvent(element, 'focus').pipe(
        ...onFocusPipe
    ).subscribe(i => $elementFocusBS.next(true))
    const $elementBlur = fromEvent(element, 'blur').pipe(
        ...onBlurPipe
    ).subscribe(i => $elementFocusBS.next(false))   
    return {
        onFocusSubscribe: $elementFocus.subscribe,
        onBlurSubscribe: $elementBlur.subscribe,
        bs: $elementFocusBS
    } 
}

export default ElementFocusBS