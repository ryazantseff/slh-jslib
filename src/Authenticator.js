import Cookies from 'js-cookie'
import {of, BehaviorSubject, Subject, interval} from 'rxjs'
import { map, tap, catchError, switchMap, filter, withLatestFrom, skipWhile } from 'rxjs/operators'
import {PostRequest, GetRequest, GoGet, GoPost} from './Requests.js'
import {runOnceOBS} from './ReactRx/ReactRx.js'

const Authenticator = ({
    apiUrl = 'http://localhost:5000',
    refreshInterval = 0,
    forceRefresh = false
} = {}) => {
    const LOGGED_OFF = 0
    const LOGGED_IN = 1
    const PENDING = 2
    const state$ = new BehaviorSubject(LOGGED_OFF).pipe(
        // tap(i => console.log(i) )
    )

    const validity$ = new BehaviorSubject({
        accessTokenValidity: false,
        refreshTokenValidity: false
    }).pipe(
        // tap(i => console.log(i))
    )
    validity$.subscribe()

    const tokenStorage$ = new BehaviorSubject({
        accessToken: null,
        refreshToken: null
    })

    const tokens$ = new BehaviorSubject(null).pipe(
        map(i => i ?
            {
                ...i,
                decodedAccessToken: JSON.parse(atob(i?.accessToken.split('.')[1])),
                decodedRefreshToken: JSON.parse(atob(i?.refreshToken.split('.')[1])),
            } : null
            
        ),
        tap(i => {
            tokenStorage$.next({
                accessToken: i?.accessToken,
                refreshToken: i?.refreshToken
            })
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
        // tap(i => console.log('checkValidity')),
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
        errorCallback: errCb
    })

    const refresh$ = refreshToken => GetRequest({
        url: `${apiUrl}/refreshToken`,
        headers: {'Authorization': `Bearer ${refreshToken}`},
        pipe: [
            map(i => i.response),
            tap(i => i?.status == 'pending' && state$.next(PENDING)),
            skipWhile(i => i?.status == 'pending'),
            
            tap(i => {
                i.status == "ok" ?
                    tokens$.next(i.data) :
                    (() => {
                        Cookies.remove('accessToken')
                        Cookies.remove('refreshToken')
                        tokens$.next(null) 
                    })()
            }),
            tap(i => checkValidity$.next())
        ]
    })


    
    const signIn$ = (login, pass, errCb) => localSignIn$(login, pass, errCb).pipe(
        tap(i => i.status == 'pending' && state$.next(PENDING)),
        skipWhile(i => i.status == 'pending'),
        switchMap(i =>
            i.status == "ok" ?
            of(i) :
            adSignIn$(login, pass, errCb)
        ),
        tap(i => i?.status == 'pending' && state$.next(PENDING)),
        skipWhile(i => i?.status == 'pending'),
        tap(i =>
            i.status == "ok" ?
                tokens$.next(i.data) :
                tokens$.next(null) 
        ),
        tap(i => checkValidity$.next())
    )

    forceRefresh ?
        refreshInterval > 0 && 
            interval(refreshInterval).pipe(
                withLatestFrom(tokens$),
                switchMap(([nextVal, tokens]) => refresh$(tokens?.refreshToken))
            ).subscribe() :
        refreshInterval > 0 &&
            interval(refreshInterval).pipe(
                withLatestFrom(state$),
                filter(([i, state]) => state != LOGGED_OFF),
                tap(i => checkValidity$.next())
            ).subscribe()

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
                groups: tokens?.decodedAccessToken?.groups,
                exp: tokens?.decodedAccessToken?.exp,
            })),
            // tap(i => console.log(i))
        ),
        getState: () => state$.getValue(),
        signIn: ({
            login,
            pass,
            errorCb = err => console.log(err),
            successCb = () => {}
        }) => runOnceOBS({
            observable: signIn$(login, pass, errorCb),
            relayFunc: i => {
                i?.status == 'ok' && successCb()
            }
        }),
        signOut: () => {
            tokens$.next(null)
            Cookies.remove('accessToken')
            Cookies.remove('refreshToken')
            checkValidity$.next()
        },
        getTokens: () => tokenStorage$.getValue(),
        authorize: ({
            validUsers = [],
            validGroups = []
        } = {}) => {
            const decodedToken = JSON.parse(atob(tokenStorage$.getValue()?.accessToken.split('.')[1]))
            const userName = decodedToken?.username 
            const groups = decodedToken?.groups
            return validUsers.includes(userName) || validGroups.some(i => groups.includes(i)) ? true : false
        }
    }
    
}

export { Authenticator }