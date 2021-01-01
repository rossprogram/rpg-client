import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';

import Footer from './footer';
import Navbar from './navbar';

import login from './login';
const Login = login.view;

import router from './router';
const Router = router.view;

function clearError(dispatch) {
  return function (ev) {
    ev.preventDefault();
    dispatch( ['clear-error'] );
    ev.stopPropagation(); 
  };
}

export function view( { state, dispatch } ) {
  let alert = (state.flashDanger) && <div class={{"alert":true, "alert-danger":true}} role="alert">
      {state.flashDanger}
      <button on-click={[[clearError(dispatch)]]} type="button" class={{close:true}} data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
      </button>
    </div>;
  
  let content = <main role="main" class={{"flex-shrink-0":true}}>
      {alert}
      <Login state={state} dispatch={dispatch}/>
    </main>;

  if (state.user) {
    content = [ <header>
                <Navbar state={state} dispatch={dispatch} />
                </header>,
                <main role="main" class={{"flex-shrink-0":true}}>
                {alert}
                <Router state={state} dispatch={dispatch}/>
                </main>
              ];
  }
  
  return <body class={{"d-flex":true, "flex-column":true, "h-100":true}}>
    { content }
    <Footer state={state} dispatch={dispatch} />
    </body>;
}

export function update( message, state ) {
  if (message[0] === 'logout') {
    return [ {...state, token: false, user: false, dropdown: false }, Cmd.none ];
  }

  if (message[0] === 'toggle-dropdown') {
    return [ {...state, dropdown: ! state.dropdown }, Cmd.none ];
  }

  if (message[0] === 'close-dropdown') {
    return [ {...state, dropdown: false }, Cmd.none ];
  }

  if (message[0] === 'clear-error') {
    return [ {...state, flashDanger: false}, Cmd.none ];
  }

  if (message[0] === 'error') {
    return [ {...state, flashDanger: message[1].toString()}, Cmd.none ];
  }
  
  if (state.user) {
    return router.update( message, state );
  } else {
    return Cmd.sequence( login.update, router.update )( message, state );
  }
}

export function init(state) {
  return router.init(state);
}

export default { init, update, view };
