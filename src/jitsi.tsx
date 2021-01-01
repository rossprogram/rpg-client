import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';
let JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;

let theNode;
let api;
let theRoom;

function createJitsi(state) {
  const domain = 'meet.jit.si';
  const options = {
    roomName: `${state.room}.rooms.rossprogram.org`,
    width: '100%',
    height: '256',
    parentNode: theNode,
    userInfo: {
      email: state.user.email,
      displayName: state.user.displayName
    },
    configOverwrite: {
        prejoinPageEnabled: false
    }    
  };
  api = new JitsiMeetExternalAPI(domain, options);  
}

function insert(vnode, state) {
  theNode = vnode.elm;
  createJitsi(state);
}

export function Jitsi( { state, dispatch } ) {
  if (state.room && state.user) {
    if (state.room !== theRoom) {
      theRoom = state.room;
      if (api) {
        api.getIFrame().remove();
        api = undefined;
        createJitsi(state);
      }
    }
    
    return <div idclass={{jitsibox: true}} hook={{insert: (vnode) => insert(vnode, state)}}>
      </div>;
  }

    return <div></div>;
}

export default { Jitsi };
