import 'regenerator-runtime/runtime'
import { renderHook, act } from '@testing-library/react-hooks'
import Cookies from 'js-cookie'
import {default as $SLH$} from "../src/main.js"

test('usePost', async () => {
    const hook = () => $SLH$().usePost({
        url: `${process.env.JWT_SERVER}/groups`
    })
    
    const { result, waitForNextUpdate } = renderHook(() => hook())
    // console.log(result.all)
    await waitForNextUpdate()
    expect(result.current.status).toEqual('ok')
    expect(result.current.data.admins).toEqual(expect.arrayContaining(['admin']))

})

test('mapFn', async () => {
    const hook = () => $SLH$().usePost({
        url: `${process.env.JWT_SERVER}/users`,
        mapFn: i => i?.status
    })
    
    const { result, waitForNextUpdate } = renderHook(() => hook())
    expect(result.current).toEqual('pending')
    await waitForNextUpdate()
    expect(result.current).toEqual(200)

})