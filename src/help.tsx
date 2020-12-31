import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';


export function update( message, state ) {
  return [ state, Cmd.none ];
}

export function init() {
  return [ {}, Cmd.none ];
}

export function view( { state, dispatch } ) {
  return <div class={{"container":true}}>
    <h1>Need help?</h1>
    <p>Email ximera@math.osu.edu</p>
    </div>
}

export default { view, init, update };
