import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';
import { Link } from './router';

export function update( message, state ) {
  if (message[0] == 'set-realms') {
    return [ {...state, realms: message[1] }, Cmd.none ];
  }
  
  return [ state, Cmd.none ];
}

export function init(state) {
  return [{...state, realms: []}, async function* () {
    try {
      let realms = await Server.getRealms( state.token );
      yield [ 'set-realms', realms ];
    } catch (error) {
      yield [ 'error', error ];
    }
  }];
}

function viewRealm( { state, dispatch }, realm ) {
  return <li><Link dispatch={dispatch} href={`/realms/${realm.id}`}>{realm.name}</Link></li>;
}

export function view( { state, dispatch } ) {
  return <div class={{container: true}}>
    <h1>Available Realms</h1>
    <ul>
    {state.realms.map( (realm) => viewRealm( { state, dispatch }, realm ) )}
    </ul>
    </div>;
}

export default { view, init, update };
