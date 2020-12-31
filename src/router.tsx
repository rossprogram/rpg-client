import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Route from 'route-parser';

import Home from './home';
import Help from './help';

function merge( state, stateAndCommands ) {
  return [ { ...state, ...stateAndCommands[0] },
           stateAndCommands[1] ];
}

function findRoute( pathname, state ) {
  let r = new Route('/:username/:repository/(*filename).tex');
  
  //if (r.match(pathname))
  //return merge( { ...state, component: ViewSource }, ViewSource.init(r.match(pathname)) );

  if (pathname === '/help')
    return [{ ...state, component: Help }, Cmd.none];
  
  if (pathname === '/')
    return [{ ...state, component: Home }, Cmd.none];

  //r = new Route('/:username/:repository/(*filename)');
  //if (r.match(pathname))
  //return merge( { ...state, component: Page }, Page.init(r.match(pathname)) );

  // No route found!
  return [state, Cmd.none];
}

export function update( message, state ) {
  if (message[0] == 'navigate-to') {
    return findRoute( message[1], state );
  }
  
  if (state && state.component) 
    return state.component.update( message, state );
  else
    return [ state, Cmd.none ];
}

export function init(state) {
  return findRoute( window.location.pathname, state );
}

function DisplayError(text) {
  return  <div class={{"container":true}}>
    <h1>Error!</h1>
    <p>{ text }</p>
    </div>;
}

export function view( { state, dispatch } ) {
  if (state && state.component) 
    return state.component.view( { state, dispatch } );
  else
    return DisplayError('No route found.');
}

const stopPropagation = function(ev) { ev.stopPropagation() };
const preventDefault = function(ev) { ev.preventDefault() };

export function Link( props, children ) {
  return <a {...props} on-click={[[preventDefault], [props.dispatch, ['navigate-to', props.href]], [() => history.pushState(null, '', props.href)], [stopPropagation]]}>{ children }</a>;
}

export default { view, init, update, Link };
