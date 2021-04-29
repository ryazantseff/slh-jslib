import 'regenerator-runtime/runtime'
import { renderHook, act } from '@testing-library/react-hooks'
import Cookies from 'js-cookie'
import {default as $SLH$} from "../src/main.js"


beforeEach(() => {
    jest.resetModules()
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
});

test('createStorage', async () => {
    const stor = $SLH$().StateStorage({
        initData: {
            iam:{
                tabs: "ad"
            }
        }
    })
    expect(stor.Snapshot()).toEqual({ iam: { tabs: 'ad' } })
})

test('OnChangeHook', async () => {
    const State = $SLH$().StateStorage({
        initData: {
            iam:{
                tabs: "ad"
            }
        }
    })
    const StateLink = $SLH$().ReactRxCustom({StatesStor: State})
    const StateHook = path => StateLink.OnChange({nodePath: path})
    const ModifyStateNode = (path, value) => State.ModifyNode({storPath: path, value}) 

    const hook = () => StateHook(['iam', 'tabs'])
    
    const { result, waitForNextUpdate } = renderHook(() => hook())
    expect(result.current).toBe('ad')
    act(() => {
        ModifyStateNode(['iam', 'tabs'], 'aaa')
    })
    expect(result.current).toBe('aaa')
    
})