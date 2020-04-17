import React, {useState, useEffect, createElement} from 'react'
import {render} from 'react-dom'
import {of, BehaviorSubject} from 'rxjs'
import {first} from 'rxjs/operators'
import StateStorage from '../StateMngr/StateMngr.js'

const ReactRx = ({
    StatesStor = StateStorage(),
    _React = React
} = {}) => {

    const OnChange = ({
        nodePath = [],
        defaultValue = {},
        mode = 'single'
    } = {}) => {
        const node = StatesStor.SubtreeByPath({nodePath})
        const [state, setState] = _React.useState(node.Snapshot())
        _React.useEffect(() => {
            const sbs = node.OnChange({
                fn: i => setState(node.Snapshot()),
                mode,
            })
            return () => {
                sbs.forEach(i => i.unsubscribe())
            }
        }, [])
        return state
    }

    const useOBS = ({
        observable = of({}),
        defaultValue = {}
    } = {}) => {
        const [state, setState] = _React.useState(defaultValue)
        _React.useEffect(() => {
            const sbs = observable.subscribe(i => setState(i), i => console.error(i))
            return () => sbs.unsubscribe()
        }, [])
        return state
    }

    const useBS = ({
        behaviorSubject = new BehaviorSubject({}),
        defaultValue = {}
    } = {}) => {
        const [state, setState] = _React.useState(defaultValue)
        _React.useEffect(() => {
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
        OnChange,
        useOBS,
        useBS,
        runOnceOBS,
        appendReactChild
    }

}

export default ReactRx