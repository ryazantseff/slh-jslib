import { fromEvent } from 'rxjs'
import { tap } from 'rxjs/operators'
import GlobalKeyboardEventsLogic from './GlobalKeyboardEventsLogic.js'
import ElementFocusBS from './ElementFocusBS.js'
import PostRequest from './PostRequest.js'
import SubscribeOnEvent from './SubscribeOnEvent.js'
import ReactRx from './ReactRx/ReactRx.js'
import StateStorage from './StateMngr/StateMngr.js'

const SantasLittleHelper = ({
    keyDownEventStream = fromEvent(document, 'keydown')
} = {}) => {


const KeyLogger = keyDownEventStream.pipe(
    rxjs.operators.tap(i => console.log(i))
)

return {
   
    GlobalKeyboardEventsLogic: GlobalKeyboardEventsLogic(keyDownEventStream),
    ElementFocusBS,
    KeyLogger,
    ReactRx: ReactRx(),
    ReactRxCustom: i => ReactRx(i),
    PostRequest,
    SubscribeOnEvent,
    StateStorage,
    RunObservable: ReactRx().runOnceOBS
    // States: StateStorage()
}
}

export default SantasLittleHelper