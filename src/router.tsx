import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Route from 'route-parser';

import Home from './home';
import Help from './help';
import Profile from './profile';
import Game from './game';

function merge( state, stateAndCommands ) {
  return [ { ...state, ...stateAndCommands[0] },
           stateAndCommands[1] ];
}

function findRoute( pathname, state ) {
  let r = new Route('/users/:email');
  
  if (r.match(pathname)) {
    return Profile.init({ ...state, component: Profile }, r.match(pathname));
  }

  if (pathname === '/') {
    return Game.init({ ...state, component: Game });
  }
  
  if (pathname === '/help')
    return [{ ...state, component: Help }, Cmd.none];
  

  //r = new Route('/:username/:repository/(*filename)');
  //if (r.match(pathname))
  //return merge( { ...state, component: Page }, Page.init(r.match(pathname)) );

  // No route found!
  return [{ ...state, component: false }, Cmd.none];
}

export function update( message, state ) {
  if (message[0] == 'navigate-to') {
    return findRoute( message[1], {...state, dropdown: false, flashDanger: false} );
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

function onClick( dispatch, href ) {
  return function(ev) {
    ev.preventDefault()

    dispatch(['navigate-to', href]);
    history.pushState(null, '', href);
    
    ev.stopPropagation();
  };
}

export function Link( props, children ) {
  return <a {...props} on-click={onClick(props.dispatch, props.href)}>{ children }</a>;
}

export default { view, init, update, Link };
