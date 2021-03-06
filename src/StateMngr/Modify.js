import {first, filter} from 'rxjs/operators'
import {BehaviorSubject} from 'rxjs'
import TypeOf from './TypeOf.js'

const sync = new BehaviorSubject(false).pipe(
    filter(i => !i)
) 

const unsubscribeSubtree = (subtree, depth = 0) => 
    (({
        'object': () => {
            Object.keys(subtree.Content.data).forEach(i => {
                unsubscribeSubtree(subtree.Content.data[i], depth + 1)
            })
            // console.log(depth)
            depth > 0 && subtree.Content.sbs.unsubscribe()
        }
    })[TypeOf(subtree.Content.data)] || (() => {
        // console.log(depth)
        depth > 0 && subtree.Content.sbs.unsubscribe()
    }))()

const objectsIntersection = (o1, o2) => {
    const [k1, k2] = [Object.keys(o1), Object.keys(o2)]
    const [first, next] = k1.length > k2.length ? [k2, o1] : [k1, o2]
    return first.filter(k => k in next)
}

const SubtreeByPath = function({storPath = [], nodePath = null} = {}) {
    storPath = nodePath != null ? nodePath : storPath
    return storPath.reduce((acc, item) => acc?.Content?.data[item], this)
} 

const ModifyNode = function({storPath = [], nodePath = null, value = {}, mode = 'replace', delay = 0} = {}) {
    storPath = nodePath != null ? nodePath : storPath    
    const modifyAction = () => {
        const subtree = SubtreeByPath.bind(this)({storPath});
        const subtreeParient = storPath.length > 0 ?
            SubtreeByPath.bind(this)({storPath: storPath.slice(0, -1)}):
            null;

        // console.log(subtree)
        const newSubtree = this.CreateStateStorage({initData: value});
        (({
            'del': () => {
                if (subtree) {
                    unsubscribeSubtree(subtree)
                    subtreeParient && delete subtreeParient.Content.data[storPath.pop()]
                }
            },
            'replace': () => {
                    unsubscribeSubtree(subtree)
                    subtree.Content.bs.next({actionType: 'replace', data: newSubtree.Content.data})
                    newSubtree.Content.sbs.unsubscribe()
            },
            'add': () => {
                (({
                    'object': () => {
                        (TypeOf(newSubtree.Content.data) == 'object') && (() => {
                            objectsIntersection(subtree.Content.data, newSubtree.Content.data).forEach(i => {
                                unsubscribeSubtree(newSubtree.Content.data[i], 1)
                                delete newSubtree.Content.data[i]
                            })
                            subtree.Content.bs.next({
                                actionType: 'add',
                                data: {...newSubtree.Content.data, ...subtree.Content.data}
                            })
                            newSubtree.Content.sbs.unsubscribe()
                        })()
                    }
                })[TypeOf(subtree.Content.data)] || (() => {

                }))()
            }
        })[mode])()
    }

    const sbs = sync.pipe(
        first()
    ).subscribe(i => {
        // console.log(i)
        sync.next(true)
        modifyAction()
        sync.next(false)

    })

    return this
}

export {ModifyNode, SubtreeByPath}