import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';
import { avatars } from './sprites';

export function update( message, state ) {
  if (message[0] == 'set-profile') {
    return [ {...state, updatingProfile: false, user: message[1] }, Cmd.none ];
  }

  if (message[0] == 'patch-profile') {
    return [{...state, updatingProfile: true}, async function* () {
      try {
        let delta = message[1];
        let user = await Server.patchProfile( state.token, state.user.id, delta );
        yield [ 'set-profile', user ];
      } catch (error) {
        yield [ 'error', error ];
      }
    }];
  }  
  
  return [ state, Cmd.none ];
}

export function init(state, route) {
  let email = route.email;
  
  return [{...state, profile: false}, async function* () {
    try {
      let user = await Server.getUser( state.token, email );
      yield [ 'set-profile', user ];
    } catch (error) {
      yield [ 'error', error ];
    }
  }];
}

function changeField(fieldName,dispatch) {
  return function (ev) {
    ev.preventDefault();

    let value = (document.getElementById(fieldName) as HTMLInputElement).value;
    let delta = {};
    delta[fieldName] = value;
    dispatch( ['patch-profile', delta ] );
    
    ev.stopPropagation(); 
  };
}


function changeAvatar(avatar,dispatch) {
  return function (ev) {
    let delta = { avatar };
    dispatch( ['patch-profile', delta ] );
    return true;
  };
}


export function view( { state, dispatch } ) {
  if (state.user) {

    let avatarButtons = Object.keys(avatars).map( (avatar) => {
      let id = `avatar${avatar}`;
      let style = {width: '16px', height:'32px',
                   "background-position": "32px -64px",
                   scale: 1,
                   "image-rendering": "crisp-edges",
                   animation: "walkSprite 0.8s steps(6) infinite",
                   "background-image": `url('${avatars[avatar]}')`};
      return <div class={{"form-check":true,"form-check-inline":true}}>
        <input on-click={[[changeAvatar(avatar,dispatch)]]}
            class={{"form-check-input":true}} type="radio" name="avatar" id={id} value={avatar} checked={state.user.avatar == avatar}></input>
          <label for={id} class={{"form-check-label":true}} style={style}></label>
        </div>;
    });

    return <div class={{container: true}}>
      <h1>Profile <small class={{"text-muted":true}}>for id <a href={`/users/${state.user.id}`}>{state.user.id}</a></small></h1>
      <form>
      <div class={{"form-group": true}}>
      <label for="displayName">Name</label>
      <input on-input={[[changeField('displayName',dispatch)]]}
        type="text" class={{"form-control":true}} id="displayName" aria-describedby="displayNameHelp" placeholder="Enter your name" value={state.user.displayName}></input>
      <small id="displayNameHelp" class={{"form-text":true, "text-muted":true}}>This is the name that other people see.</small>
      </div>
      <hr/>
      <div class={{"form-group": true}}>
        <label for="avatar" aria-describedby="avatarHelp">Avatar</label>
        <div class={{"form-group": true}}>
          { avatarButtons }
        </div>
        <small id="avatarHelp" class={{"form-text":true, "text-muted":true}}>This is how other people will see you.</small>  
      </div>
      <hr/>      
      <div class={{"form-group": true}}>
      <label for="displayName">LinkedIn URL</label>
      <input on-input={[[changeField('linkedIn',dispatch)]]}
        type="url" class={{"form-control":true}} id="linkedIn" aria-describedby="linkedInHelp" placeholder="https://www.linkedin.com/in/name" value={state.user.linkedIn}></input>
      <small id="linkedInHelp" class={{"form-text":true, "text-muted":true}}>This is your page on LinkedIn, e.g., <code>https://www.linkedin.com/in/name</code></small>
      </div>
      <hr/>            
      <div class={{"form-group": true}}>
      <label for="displayName">Twitter handle</label>
      <div class={{"input-group":true, "mb-2":true}}>
        <div class={{"input-group-prepend":true}}>
          <div class={{"input-group-text":true}}>@</div>
        </div>    
        <input on-input={[[changeField('twitter',dispatch)]]}
          type="text" class={{"form-control":true}} id="twitter" aria-describedby="twitterHelp" placeholder="username" value={state.user.twitter}></input>
      </div>
      <small id="twitterHelp" class={{"form-text":true, "text-muted":true}}>This is your @name on Twitter.</small>
      </div>
      </form>
      </div>;
    /*
      <hr/>            
      <div class={{"form-group": true}}>
      <label for="email">Email address</label>
      <input type="email" class={{"form-control":true}} id="email" readonly={true} aria-describedby="emailHelp" placeholder="Enter email" value={state.user.email}></input>
      <small id="emailHelp" class={{"form-text":true, "text-muted":true}}>We'll never share your email with anyone else.</small>
      </div>
      <div class={{"form-group": true}}>
      <label for="password">Password</label>
      <input type="password" class={{"form-control":true}} id="password" placeholder="Password"></input>
      </div>
      <hr/>      
      <div class={{"form-check": true}}>
      <input type="checkbox" class={{"form-check-input":true}} id="exampleCheck1"></input>
      <label class={{"form-check-label":true}} for="exampleCheck1">Check me out</label>
      </div>
      <button type="submit" class={{"btn":true, "btn-primary":true}}>Save</button>      
      <p>{JSON.stringify(state)}</p>
    */
  }

  return <div class={{container: true}}>
      <h1>Profile</h1>
      </div>;
}

export default { view, init, update };
