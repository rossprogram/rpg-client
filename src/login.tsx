import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';

function doLogin(dispatch) {
  return function (ev) {
    ev.preventDefault();

    let email = (document.getElementById('email') as HTMLInputElement).value;
    let password = (document.getElementById('password') as HTMLInputElement).value;

    dispatch( ['login', { email, password } ] );
    
    ev.stopPropagation(); 
  };
}

export function view( { state, dispatch } ) {
  return <div class={{"container":true}}>
    <div class={{row:true, "align-items-center": true}}>
    <div class={{"col":true}}></div>
    <div class={{"col":true}}>
    <form>
    <div class={{"form-group": true}}>
      <label for="exampleInputEmail1">Email address</label>
      <input type="email" class={{"form-control": true}} id="email" aria-describedby="emailHelp" placeholder="Enter email"/>
    </div>
    <div class={{"form-group": true}}>
      <label for="exampleInputPassword1">Password</label>
      <input type="password" class={{"form-control": true}} id="password" placeholder="Password"/>
    </div>
    <button on-click={[[doLogin(dispatch)]]} class={{"btn-primary": true, btn: true}}>Login</button>
    </form></div>
    <div class={{"col":true}}></div>
    </div>
    </div>;
}

export function update( message, state ) {
  if (message[0] === 'token') {
    let token = message[1].token;
    let user = message[1].user;
    return [ {...state, token, user, loggingIn: false}, Cmd.none ];
  }
  
  if (message[0] === 'login') {
    let { email, password } = message[1];

    return [{...state, loggingIn: true}, async function* () {
      try {
        let tokenAndUser = await Server.getToken( email, password );
        yield [ 'token', tokenAndUser ];
      } catch (error) {
        yield [ 'error', error ];
      }
    }];
  }
  
  return [state, Cmd.none];
}

export default { update, view };
