import 'regenerator-runtime/runtime'
import { renderHook, act } from '@testing-library/react-hooks'
import Cookies from 'js-cookie'
import {default as $SLH$} from "../src/main.js"
import { tap, map, filter, switchMap, first, skip, skipWhile } from 'rxjs/operators'


beforeEach(() => {
    jest.resetModules()
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
});

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
                // console.log(i)
                expect(i.userName).toBe('mryazantsev')
                expect(i.state).toBe(auth.states.LOGGED_IN)
                done()
            })()
    })
})

test('authorize', async () => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    expect(auth.authorize({validGroups: ['admins']})).toBe(false)
    auth.signIn({
        'login': 'admin',
        'pass': ''
    })
    const authState = await auth.stateObs.pipe(
        skipWhile(i => i?.state != auth.states.LOGGED_IN),
        first()
    ).toPromise()
    expect(authState?.userName).toBe('admin')
    expect(authState?.state).toBe(auth.states.LOGGED_IN)
    expect(auth.authorize({validGroups: ['admins']})).toBe(true)
    expect(auth.authorize({validUsers: ['mryazantsev']})).toBe(false)
})

test('useAuthorizeUser', async () => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    const hook = () => auth.useAuthorize({validUsers: ['admin']})
    const { result, waitForNextUpdate } = renderHook(() => hook())

    expect(result.current).toBe(false)
    act(() => {
        auth.signIn({
            'login': 'admin',
            'pass': ''
        })

    })
    await waitForNextUpdate()
    expect(result.current).toBe(true)
    act(() => {
        auth.signIn({
            'login': 'mryazantsev',
            'pass': 'Rssgx14rc'
        })

    })
    await waitForNextUpdate()
    expect(result.current).toBe(false)

})

test('useAuthorizeGroup', async () => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    const hook = () => auth.useAuthorize({validGroups: ['admins']})
    const { result, waitForNextUpdate } = renderHook(() => hook())

    expect(result.current).toBe(false)
    auth.signIn({
        'login': 'admin',
        'pass': ''
    })
    await waitForNextUpdate()
    expect(result.current).toBe(true)

})

test('request', async () => {
    let response = await $SLH$().Request({
        url: `${process.env.JWT_SERVER}/groups`,
        method: 'POST'
    }).toPromise()
    expect(response.status).toEqual('ok')
    expect(response.data.admins).toEqual(expect.arrayContaining(['admin']))
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
        skipWhile(i => i?.state != auth.states.LOGGED_IN),
        first()
    ).toPromise()
    // console.log(authState)
    await new Promise((r) => setTimeout(r, 3000));
    const authState1 = await auth.stateObs.pipe(
        skipWhile(i => i?.state != auth.states.LOGGED_IN),
        first()
    ).toPromise()
    // console.log(authState1)
    expect(authState1?.exp > authState?.exp).toBe(true)

})

test('useAuthorizeRefresh', async () => {
    const auth = $SLH$().Authenticator({
        apiUrl: process.env.JWT_SERVER,
        refreshInterval: 500,
        forceRefresh: true
    })

    const hook = () => auth.useAuthorize({validGroups: ['admins']})
    const { result, waitForNextUpdate } = renderHook(() => hook())

    expect(result.current).toBe(false)
    auth.signIn({
        'login': 'admin',
        'pass': ''
    })
    await waitForNextUpdate()
    expect(result.current).toBe(true)
    console.log(auth.getState())
    await waitForNextUpdate()
    expect(result.current).toBe(true)
    console.log(auth.getState())
})

test('tokenWrapedRequest', async () => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    auth.signIn({
        'login': 'admin',
        'pass': ''
    })
    const authState = await auth.stateObs.pipe(
        skipWhile(i => i?.state != auth.states.LOGGED_IN),
        first()
    ).toPromise()
    let response = await auth.tokenWrapedRequest({
        url: `${process.env.JWT_SERVER}/users`,
        method: 'PUT',
        data: {
            'name': ['mryazantsev', 'yyashmolkin', 'igulenko'],
            'type': 'AD'
        }
    }).toPromise()
    expect(response.data.map(i => i?.name)).toEqual(
        expect.arrayContaining(['mryazantsev', 'yyashmolkin', 'igulenko'])
    )
    response = await auth.tokenWrapedRequest({
        url: `${process.env.JWT_SERVER}/users`,
        method: 'DELETE',
        data: { 'name': 'yyashmolkin' }
    }).toPromise()
    response = await auth.tokenWrapedRequest({
        url: `${process.env.JWT_SERVER}/users`,
        method: 'DELETE',
        data: { 'name': 'igulenko' }
    }).toPromise()
    expect(response.data.map(i => i?.name)).not.toEqual(
        expect.arrayContaining(['yyashmolkin', 'igulenko'])
    )
})


test('useAuthorizeWrongPassword', async () => {
    const auth = $SLH$().Authenticator({apiUrl: process.env.JWT_SERVER})
    const hook = () => auth.useAuthorize()
    const { result, waitForNextUpdate, waitForValueToChange } = renderHook(() => hook())

    expect(result.current).toBe(false)
    act(() => {

        auth.signIn({
            'login': 'admin',
            'pass': 'asdasd'
        })
    })
    await new Promise((r) => setTimeout(r, 500));
    expect(result.current).toBe(false)
    act(()=>{
        auth.signIn({
            'login': 'admin',
            'pass': ''
        })

    })
    await waitForNextUpdate()
    expect(result.current).toBe(true)
    act(()=>{
        auth.signIn({
            'login': 'mryazantsev',
            'pass': 'dsfsdfsdf'
        })

    })
    await new Promise((r) => setTimeout(r, 500));
    expect(result.current).toBe(false)
    act(()=>{
        auth.signIn({
            'login': 'mryazantsev',
            'pass': 'Rssgx14rc'
        })

    })
    await waitForNextUpdate()
    expect(result.current).toBe(true)

})