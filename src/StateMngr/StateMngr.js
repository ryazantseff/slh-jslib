import {BehaviorSubject} from 'rxjs'
import {filter, first, skip} from 'rxjs/operators'
import TypeOf from './TypeOf.js'
import {OnAdd, OnChange, Subscribe} from './Subscribe.js'
import {ModifyNode, SubtreeByPath} from './Modify.js'



const createStateStorage = ({initData = {}} = {}) => {

    const createNode = body => {
        let node = {}
        node['bs'] = new BehaviorSubject({actionType: 'create', data: body})
        node['sbs'] = node['bs'].subscribe(i => node['data'] = i.data)
        return node
    }

    const createSubtree = (data) => 
        (({
            'object': () => {
                const bsBody = Object.keys(data).reduce((acc, key) => {
                    // console.log(key)
                    acc[key] = createStateStorage({initData: data[key]})
                    return acc
                }, {})
                // console.log(bsBody)
                return createNode(bsBody)
            }
        })[TypeOf(data)] || (() => {
            return createNode(data)
        }))()
    
    const stors = createSubtree(initData)

    const Snapshot = function(subTree) {
        const snapshot = (st) => {
            // console.log(st)
            return (({
                'object': () => 
                    Object.keys(st.Content.data).reduce((acc, key) => {
                        acc[key] = snapshot(st.Content.data[key])
                        return acc
                    }, {})

            })[TypeOf(st.Content.data)] || (() => {
                return st.Content.data
            }))()
            
        }
        // console.log(subTree)    
        return subTree ? snapshot(subTree) : snapshot(this)
    }

    return {
        CreateStateStorage: createStateStorage,
        OnAdd,
        OnChange,
        Subscribe,
        ModifyNode,
        Snapshot,
        SubtreeByPath,
        Content: stors,
    }
}

let stateStorageSinglton = undefined

const StateStorage = ({initData = {}} = {}) => {
    // console.log(stateStorageSinglton)
    if(stateStorageSinglton == undefined) {
        stateStorageSinglton = createStateStorage({initData})
    }
    return stateStorageSinglton
}

export default StateStorage