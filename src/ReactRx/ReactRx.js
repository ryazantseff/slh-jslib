import {useState, useEffect, createElement} from 'react'
import {render} from 'react-dom'
import {of, BehaviorSubject} from 'rxjs'
import {first} from 'rxjs/operators'

const ReactRx = () => {
    const useOBS = ({
        observable = of({}),
        defaultValue = {}
    } = {}) => {
        const [state, setState] = useState(defaultValue)
        useEffect(() => {
            const sbs = observable.subscribe(i => setState(i), i => console.error(i))
            return () => sbs.unsubscribe()
        }, [])
        return state
    }

    const useBS = ({
        behaviorSubject = new BehaviorSubject({}),
        defaultValue = {}
    } = {}) => {
        const [state, setState] = useState(defaultValue)
        useEffect(() => {
            const sbs = behaviorSubject.subscribe(i => setState(i), i => console.error(i))
            return () => sbs.unsubscribe()
        }, [])
        return [state, i => behaviorSubject.next(i)]
    }

    const runOnceOBS = ({
        observable = of({}),
        relayFunc = () => {}
    } = {}) => {
        // console.log(observable)
        const sbs = observable.pipe(
            first()
        ).subscribe(i => {
            relayFunc(i)
            // sbs.unsubscribe()
        })
    }

    const appendReactChild = ({
        parent = document.body,
        child = createElement('div', {}, "mock")
    } = {}) => {
        const reactHost = document.createElement("div")
        parent.appendChild(reactHost)
        render(createElement(child), reactHost)
        return parent
    }

    return {
        useOBS,
        useBS,
        runOnceOBS,
        appendReactChild
    }

}

export default ReactRx