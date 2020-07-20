import { fromEvent, BehaviorSubject} from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { tap, map, filter, switchMap } from 'rxjs/operators'
import GlobalKeyboardEventsLogic from './GlobalKeyboardEventsLogic.js'
import ElementFocusBS from './ElementFocusBS.js'
import {PostRequest, GetRequest, GoGet, GoPost, Pipes} from './Requests.js'
import SubscribeOnEvent from './SubscribeOnEvent.js'
import ReactRx from './ReactRx/ReactRx.js'
import StateStorage from './StateMngr/StateMngr.js'
import {WebSocketMsg, CombineStreams} from './WebSocketMsg/wsmsg.js'
import {Authenticator} from './Authenticator.js'
import moment from 'moment'

const SantasLittleHelper = ({
    keyDownEventStream = fromEvent(document, 'keydown')
} = {}) => {


    const KeyLogger = keyDownEventStream.pipe(
        tap(i => console.log(i))
    )

    return {
        WebSocketMsg,
        CombineStreams,
        GlobalKeyboardEventsLogic: GlobalKeyboardEventsLogic(keyDownEventStream),
        ElementFocusBS,
        KeyLogger,
        ReactRx: ReactRx(),
        ReactRxCustom: i => ReactRx(i),
        R: ReactRx().internalReact,
        RD: ReactRx().internalReactDOM,
        RH: ReactRx().internalReactHooks,
        PostRequest,
        GetRequest,
        GoGet,
        GoPost,
        Pipes,
        SubscribeOnEvent,
        StateStorage,
        RunObservable: ReactRx().runOnceOBS,
        RxOps: {
            'map': map,
            'ajax': ajax,
            'tap': tap,
            'filter': filter, 
            'fromEvent': fromEvent,
            'switchMap': switchMap,
            'BehaviorSubject': BehaviorSubject
        },
        Authenticator,
        KeyDownEventStream: keyDownEventStream,
        moment
    }
}

export default SantasLittleHelper