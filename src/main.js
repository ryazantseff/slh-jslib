import { fromEvent, BehaviorSubject} from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { tap, map, filter, switchMap, first, skip, skipWhile } from 'rxjs/operators'
import GlobalKeyboardEventsLogic from './GlobalKeyboardEventsLogic.js'
import ElementFocusBS from './ElementFocusBS.js'
import {
    usePost,
    useGet,
    usePut,
    useDel,
    Request, PostRequest, GetRequest, GoGet, GoPost, GoPut, GoDel, Pipes} from './Requests.js'
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
        PropTypes: ReactRx().PropTypes,
        R: ReactRx().internalReact,
        RD: ReactRx().internalReactDOM,
        RH: ReactRx().internalReactHooks,
        Request,
        PostRequest,
        GetRequest,
        GoGet,
        GoPost,
        GoPut,
        GoDel,
        usePost,
        useGet,
        usePut,
        useDel,
        Pipes,
        SubscribeOnEvent,
        StateStorage,
        RunObservable: ReactRx().runOnceOBS,
        RxOps: {
            'skipWhile': skipWhile,
            'skip': skip,
            'first': first,
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