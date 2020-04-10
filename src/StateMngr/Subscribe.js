import {filter, skip} from 'rxjs/operators'

const actionPipe = {
    'change': [skip(1)],
    'add': [skip(1), filter(i => i.actionType == 'add')]
}

const subscribeSubtree = (node, fn, act) => 
    (({
        'object': () => 
            Object.keys(node.Content.data).reduce((acc, key) => 
                [...acc, subscribeSubtree(node.Content.data[key], fn)]
            , [])
    })[TypeOf(node.Content.data)] || (() => 
        node.Content.bs.pipe(
            ...actionPipe[act]
        ).subscribe(i => fn(i.data))
    ))()

const subscribeSingle = (node, fn, act) => 
    node.Content.bs.pipe(
        ...actionPipe[act]
    ).subscribe(i => fn(i.data))

const subscribeLevel = (node, fn, act) =>
    Object.keys(node.Content.data).reduce((acc, key) => 
        [
            ...acc,
            node.Content.data[key].Content.bs.pipe(
                ...actionPipe[act]
            ).subscribe(i => fn(i.data))
        ]
    , [])

const OnChange = function({fn = (() => {}), mode = 'single'} = {}) {
    return (({
        'single': () => [subscribeSingle(this, fn, 'change')],
        'tree': () => [...subscribeSubtree(this, fn, 'change'), subscribeSingle(this, fn, 'change')],
        'level': () => [...subscribeLevel(this, fn, 'change'), subscribeSingle(this, fn, 'change')]
    })[mode] || (() => {}))()
}

const OnAdd = function({fn = (() => {}), mode = 'single'} = {}) {
    return (({
        'single': () => [subscribeSingle(this, fn, 'add')],
        'tree': () => [...subscribeSubtree(this, fn, 'add'), subscribeSingle(this, fn, 'add')],
        'level': () => [...subscribeLevel(this, fn, 'add'), subscribeSingle(this, fn, 'add')]
    })[mode] || (() => {}))()
}

export {OnChange, OnAdd}