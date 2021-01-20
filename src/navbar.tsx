import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import { Link } from './router';

import icon from './icons';

function toggleDropdown(dispatch) {
  return function (ev) {
    ev.preventDefault();
    dispatch( ['toggle-dropdown'] );
    ev.stopPropagation(); 
    return false;
  };
}

function closeDropdown(dispatch) {
  return function (ev) {
    ev.preventDefault();
    dispatch( ['close-dropdown'] );
    ev.stopPropagation(); 
    return false;
  };
}

function logout(dispatch) {
  return function (ev) {
    ev.preventDefault();
    dispatch( ['logout'] );
    ev.stopPropagation(); 
    return false;
  };
}

function andAlso(dispatch,handler) {
  return function (message) {
    handler(dispatch);
    dispatch(message);
  };  
}

export function view( { state, dispatch } ) {
  return <nav class={{navbar:true, "navbar-expand-md":true, "navbar-light":true, "bg-light": true}}>
    <Link class={{"navbar-brand":true}} dispatch={dispatch} href="/">RPG</Link>
    <button class={{"navbar-toggler":true}} type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class={{"navbar-toggler-icon":true}}></span>
    </button>
    <div class={{collapse:true, "navbar-collapse":true}} id="navbarNav">
    <ul class={{"navbar-nav":true}}>
    <li class={{"nav-item":true}}>
    <Link class={{"nav-link":true}} dispatch={dispatch} href="/help">Help</Link>
    </li>
    </ul>
    <ul class={{"navbar-nav":true, "ml-auto": true}}>
    <li class={{"nav-item":true, "dropdown": true, "show": state.dropdown===true}}>
    <a class={{"nav-link":true,  "dropdown-toggle":true}} href="#" on-click={toggleDropdown(dispatch)} id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded={state.dropdown===true}>
    {state.user.email || state.user.displayName}
    </a>
    <div class={{"dropdown-menu":true, "show": state.dropdown===true}} aria-labelledby="navbarDropdownMenuLink">
    <Link class={{"dropdown-item":true}} dispatch={dispatch} href={`/users/${state.user.email || state.user.id}`}>{icon('id-card')}&nbsp;Profile</Link>
    <a class={{"dropdown-item":true}} href="#" on-click={(ev) => logout(dispatch)(ev)}>{icon('sign-out-alt')}&nbsp;Logout</a>
    </div>
    </li>
    </ul>
    </div>
    </nav>;}



export default view;
