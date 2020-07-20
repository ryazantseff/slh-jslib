    // State.OnChange({
    //     fn: i => console.log(State.Snapshot()),
    //     mode: 'single'
    //   })

 
    // State
    //   .ModifyNode({value:{auth: {state: false}}})
      // .SubtreeByPath({storPath: ['auth']})
      // .OnChange({
      //     fn: i => console.log(State.Snapshot()),
      //     mode: 'level'
      //   })

    // console.log(t)

    // const test = $SLH$.StateStorage() 

    // console.log(test)
    
    // console.log(test.Snapshot())

    // test.SubtreeByPath({storPath: ['test', 'test2']}).OnChange(i => console.log(`test2 changed ${i}`))
    // test.SubtreeByPath({storPath: ['test', 'key3']}).OnChange(i => console.log(`key3 changed ${i}`))
    
    // test.SubtreeByPath({storPath: ['test', 'test2']}).ModifyNode({value: "new subtree"})
    // test.ModifyNode({storPath: ['test', 'key3'], value: {newSubTree: {key1:'one', key2: 2}}})

    // test.SubtreeByPath({storPath: ['test', 'key3', 'newSubTree']}).OnChange(i => console.log(`newSubTree changed ${i}`))
    // test.SubtreeByPath({storPath: ['test', 'key3', 'newSubTree']}).OnAdd(i => console.log(`newSubTree added ${i}`))
    
    // test.ModifyNode({storPath: ['test', 'key3', 'newSubTree'], value: {newKey: 'sdfjhsdg'}, mode: 'add'})
    // test.ModifyNode({storPath: ['test', 'key3', 'newSubTree'], value: 'replaced'})

    

    // setTimeout(i => console.log(test.Snapshot()), 100)
    // console.log(test.Snapshot())
 

    // console.log(s)
    // $SLH$
    //   .StateStorage()
    //   .SubtreeByPath({storPath: ['auth']})
    //   .OnChange(i => 
    //       console.log(
    //         $SLH$
    //           .StateStorage()
    //           .Snapshot()
    //       )
    //   )
    
    // $SLH$.RunObservable({
    //     observable: 
    //         $SLH$.PostRequest({
    //             url: 'http://<?php echo getenv('URL'); ?>/controller/checkAuth.php',
    //             pipe: [
    //                 rxjs.operators.map(i => i.response),
    //                 rxjs.operators.filter(i => i !== undefined),
    //                 rxjs.operators.tap(i => {
    //                   i.status == 'ok' && (()=>{
    //                     State
    //                       .ModifyNode({storPath: ['auth'], value: {userData: i.data[0]}, mode: 'add'})
    //                     State
    //                       .ModifyNode({storPath: ['auth', 'state'], value: true})

    //                   })() 
    //                 }),
    //             ]
    //         })
    // })

        // auth.stateObs.subscribe(i => {
    //   i.state == auth.states.LOGGED_IN &&
    //     State.ModifyNode({storPath: ['auth'], value: {userData: {
    //       activeUser: i?.userName,
    //       timeIn: i?.exp
    //     }}, mode: 'add'}) &&
    //     State.ModifyNode({storPath: ['auth', 'state'], value: true}) 
    //   i.state == auth.states.LOGGED_OFF &&
    //     State.ModifyNode({storPath: ['auth', 'userData'], mode: 'del'}) &&
    //     State.ModifyNode({storPath: ['auth', 'state'], value: false}) 
    // })
    // auth.signIn('mryazantsev', 'Rssgx14rc')
    
    // console.log(tokens)