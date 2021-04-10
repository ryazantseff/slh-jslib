import 'regenerator-runtime/runtime'
import { renderHook, act } from '@testing-library/react-hooks/native'
import {default as $SLH$} from "../src/main.js"

test('login as admin', done => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    auth.signIn({
        'login': 'admin',
        'pass': ''
    })
    auth.stateObs.subscribe(i => {
        i?.state == auth.states.PENDING ?
            console.log(i) :
            (()=>{
                console.log(i)
                expect(i.userName).toBe('admin')
                expect(i.state).toBe(auth.states.LOGGED_IN)
                done()
            })()
    })
});

test('login as mryazantsev', done => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    auth.signIn({
        'login': 'mryazantsev',
        'pass': 'Rssgx14rc'
    })
    auth.stateObs.subscribe(i => {
        i?.state == auth.states.PENDING ?
            console.log(i) :
            (()=>{
                console.log(i)
                expect(i.userName).toBe('mryazantsev')
                expect(i.state).toBe(auth.states.LOGGED_IN)
                done()
            })()
    })
})

test('authorize', async () => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    auth.signIn({
        'login': 'admin',
        'pass': ''
    })
    const authState = await auth.stateObs.pipe(
        $SLH$().RxOps.skipWhile(i => i?.state != auth.states.LOGGED_IN),
        $SLH$().RxOps.first()
    ).toPromise()
    expect(authState?.userName).toBe('admin')
    expect(authState?.state).toBe(auth.states.LOGGED_IN)
    expect(auth.authorize({validGroups: ['admins']})).toBe(true)
    expect(auth.authorize({validUsers: ['mryazantsev']})).toBe(false)
})

test('request', async () => {
    let response = await $SLH$().Request({
        url: `${process.env.JWT_SERVER}/groups`,
        method: 'POST'
    }).toPromise()
    expect(response.status).toEqual('ok')
    expect(response.data).toContainEqual({ name: 'admins' })
    response = await $SLH$().Request({
        url: `${process.env.JWT_SERVER}/usersingroup`,
        method: 'POST'
    }).toPromise()
    expect(response.status).toEqual('ok')
    expect(response.data).toHaveProperty('admins')
    expect(response.data.admins).toContain('admin')
    response = await $SLH$().Request({
        url: `${process.env.JWT_SERVER}/users`,
        method: 'POST'
    }).toPromise()
    expect(response.status).toEqual('ok')
    expect(response.data).toContainEqual({ name: 'admin', type: 'LOCAL', mail: null })
})

test('usePost', async () => {
    const hook = () => $SLH$().usePost({
        url: `${process.env.JWT_SERVER}/groups`
    })
    
    const { result, waitForNextUpdate } = renderHook(() => hook())
    await waitForNextUpdate()
    expect(result.current.status).toEqual('ok')
    expect(result.current.data).toContainEqual({ name: 'admins' })

})

test('refresh', async () => {
    const auth = $SLH$().Authenticator({
        apiUrl: process.env.JWT_SERVER,
        refreshInterval: 2000,
        forceRefresh: true
    })
    auth.signIn({
        'login': 'admin',
        'pass': ''
    })
    const authState = await auth.stateObs.pipe(
        $SLH$().RxOps.skipWhile(i => i?.state != auth.states.LOGGED_IN),
        $SLH$().RxOps.first()
    ).toPromise()
    await new Promise((r) => setTimeout(r, 3000));
    const authState1 = await auth.stateObs.pipe(
        $SLH$().RxOps.skipWhile(i => i?.state != auth.states.LOGGED_IN),
        $SLH$().RxOps.first()
    ).toPromise()
    expect(authState1?.exp > authState?.exp).toBe(true)

})