import Cookies from 'js-cookie'
import {of, BehaviorSubject, Subject, interval} from 'rxjs'
import { map, tap, catchError, switchMap, filter, withLatestFrom } from 'rxjs/operators'
import {PostRequest, GetRequest, GoGet, GoPost} from './Requests.js'
import {runOnceOBS} from './ReactRx/ReactRx.js'

const Authenticator = ({
    apiUrl = 'http://localhost:5000',
    refreshInterval = 10000
} = {}) => {
    const LOGGED_OFF = 0
    const LOGGED_IN = 1
    const PENDING = 2
    const state$ = new BehaviorSubject(LOGGED_OFF).pipe(
        tap(i =>
            console.log(i)
        )
    )

    const validity$ = new BehaviorSubject({
        accessTokenValidity: false,
        refreshTokenValidity: false
    }).pipe(
        tap(i => console.log(i))
    )
    validity$.subscribe()

    const tokens$ = new BehaviorSubject(null).pipe(
        map(i => i ?
            {
                ...i,
                decodedAccessToken: JSON.parse(atob(i?.accessToken.split('.')[1])),
                decodedRefreshToken: JSON.parse(atob(i?.refreshToken.split('.')[1])),
            } : null
            
        ),
        // tap(i => console.log(i)),
        tap(i => {
            i?.accessToken && Cookies.set('accessToken', i?.accessToken)
            i?.refreshToken && Cookies.set('refreshToken', i?.refreshToken)
        }),
        catchError(error => {
            console.log('error: ', error);
            return rxjs.of(error);
        })
    )
    tokens$.subscribe()

    const loadTokensFromCookies = () => {
        const loaded = {
            'accessToken': Cookies.get('accessToken'),
            'refreshToken': Cookies.get('refreshToken')
        }
        if(loaded?.accessToken && loaded?.refreshToken) {
            tokens$.next(loaded) 
            checkValidity$.next()
        }
    }

    const checkValidity$ = new Subject().pipe(
        tap(i => console.log('checkValidity')),
        withLatestFrom(tokens$),
        tap(([nextVal, tokens]) => {
            validity$.next({
                accessTokenValidity: Date.now()/1000 < tokens?.decodedAccessToken?.exp,
                refreshTokenValidity: Date.now()/1000 < tokens?.decodedRefreshToken?.exp
            })
        })
    )
    checkValidity$.subscribe()
    
    const adSignIn$ = (login, pass, errCb) => GetRequest({
        url: `${apiUrl}/kerbSignIn`,
        headers: {'Authorization': `Basic ${btoa(login + ':' + pass)}`},
        errorCallback: errCb
    })

    const localSignIn$ = (login, pass, errCb) => GetRequest({
        url: `${apiUrl}/signIn`,
        headers: {'Authorization': `Basic ${btoa(login + ':' + pass)}`},
        rrorCallback: errCb
    })

    const refresh$ = refreshToken => GetRequest({
        url: `${apiUrl}/refreshToken`,
        headers: {'Authorization': `Bearer ${refreshToken}`},
        pipe: [
            map(i => i.response),
            tap(i => console.log(i)),
            tap(i => {
                i.status == "OK" ?
                    tokens$.next(i.data) :
                    tokens$.next(null) 
            }),
            tap(i => checkValidity$.next())
        ]
    })
    // refresh$.subscribe()
    
    const signIn$ = (login, pass, errCb) => localSignIn$(login, pass, errCb).pipe(
        switchMap(i =>
            i.status == "OK" ?
                of(i) :
                adSignIn$(login, pass, errCb)
        ),
        tap(i =>
            i.status == "OK" ?
                tokens$.next(i.data) :
                tokens$.next(null) 
        ),
        tap(i => checkValidity$.next())
    )

    const scheduler$ = interval(refreshInterval).pipe(
        withLatestFrom(state$),
        filter(([i, state]) => state != LOGGED_OFF),
        tap(i => checkValidity$.next())
    )
    scheduler$.subscribe()

    validity$.pipe(
        withLatestFrom(tokens$),
        switchMap(([validity, tokens]) => 
            validity?.accessTokenValidity && validity?.refreshTokenValidity && (()=>{
                state$.next(LOGGED_IN)
                return of(validity)
            })() ||
            !validity?.accessTokenValidity && validity?.refreshTokenValidity && (()=>{
                state$.next(PENDING)
                return refresh$(tokens?.refreshToken)
            })() ||
            !validity?.accessTokenValidity && !validity?.refreshTokenValidity && (()=>{
                state$.next(LOGGED_OFF)
                return of(validity)
            })() 
        )
    ).subscribe()

    loadTokensFromCookies()
    return {
        states: {
            LOGGED_OFF,
            LOGGED_IN,
            PENDING
        },
        stateObs: state$.pipe(
            withLatestFrom(tokens$),
            map(([state, tokens]) => ({
                state,
                userName: tokens?.decodedAccessToken?.username, 
                roles: tokens?.decodedAccessToken?.roles,
                exp: tokens?.decodedAccessToken?.exp,
            })),
            tap(i => console.log(i))
        ),
        getState: () => state$.getValue(),
        signIn: (
            login,
            pass,
            errCb = err => console.log(err),
            sucCb = () => {}
        ) => runOnceOBS({
            observable: signIn$(login, pass, errCb),
            relayFunc: i => {
                i?.status == 'OK' && sucCb()
            }
        }),
        signOut: () => {
            tokens$.next(null)
            Cookies.remove('accessToken')
            Cookies.remove('refreshToken')
            checkValidity$.next()
        }
    }
    
}

export { Authenticator }