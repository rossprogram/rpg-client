import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';

export function update( message, state ) {
  if (message[0] == 'set-profile') {
    return [ {...state, profile: message[1] }, Cmd.none ];
  }
  
  return [ state, Cmd.none ];
}

export function init(state, route) {
  let email = route.email;
  
  return [{...state, profile: false}, async function* () {
    try {
      let user = await Server.getUser( state.token, email );
      yield [ 'set-profile', user.id ];
      yield [ 'add-user', user ];
    } catch (error) {
      yield [ 'error', error ];
    }
  }];
}

export function view( { state, dispatch } ) {
  return <div class={{container: true}}>
    <h1>Profile</h1>
    <p>{JSON.stringify(state)}</p>
    </div>;
}

export default { view, init, update };
