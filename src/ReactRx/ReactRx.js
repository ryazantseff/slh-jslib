import React, {useState, useEffect, useRef, createElement} from 'react'
import PropTypes from 'prop-types'
import ReactDOM, {render} from 'react-dom'
import {of, BehaviorSubject} from 'rxjs'
import {first} from 'rxjs/operators'
import StateStorage from '../StateMngr/StateMngr.js'

const runOnceOBS = ({
    observable = of({}),
    relayFunc = () => {}
} = {}) => {
    observable.pipe(
        first()
    ).subscribe(i => {
        relayFunc(i)
    })
}

const ReactRx = ({
    StatesStor = StateStorage(),
    _React = React,
    _render =  render
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
    
    const useSM = ({
        nodePath = [],
        defaultValue = {},
        mode = 'single'
    } = {}) => {
        const node = StatesStor.SubtreeByPath({nodePath})
        const modifyState = newValue => 
            StatesStor.ModifyNode({storPath: nodePath, value: newValue})
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
        return [state, modifyState]
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

    const appendReactChild = ({
        parent = document.body,
        child = createElement('div', {}, "mock")
    } = {}) => {
        const reactHost = document.createElement("div")
        parent.appendChild(reactHost)
        render(createElement(child), reactHost)
        return parent
    }

    const insertReactChildBefore = ({
        parent = document.body,
        pointer = document.body.childNodes[0],
        child = _React.createElement('div', {}, "mock")
    } = {}) => {
        const reactHost = document.createElement("div")
        parent.insertBefore(reactHost, pointer)
        _render(_React.createElement(child), reactHost)
        return parent
    }

    return {
        OnChange,
        useOBS,
        useBS,
        useSM,
        runOnceOBS,
        appendReactChild,
        insertReactChildBefore,
        PropTypes,
        internalReact: React,
        internalReactDOM: ReactDOM,
        internalReactHooks: {
            useState,
            useEffect,
            useRef 
        }
    }

}

export default ReactRx
export {runOnceOBS}