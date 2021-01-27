import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';
let JitsiMeetJS = (window as any).JitsiMeetJS;

const options = {
  hosts: {
    domain: 'meet.jit.si',
    muc: 'conference.meet.jit.si', 
    focus: 'focus.meet.jit.si',
  }, 
  externalConnectUrl: 'https://meet.jit.si/http-pre-bind', 
  enableP2P: true, 
  p2p: { 
    enabled: true, 
    preferH264: true, 
    disableH264: true, 
    useStunTurn: true,
  }, 
  useStunTurn: true, 
  bosh: `https://meet.jit.si/http-bind?room=rossrpg`,
  websocket: 'wss://meet.jit.si/xmpp-websocket', 
  clientNode: 'http://jitsi.org/jitsimeet', 
}

const confOptions = {
    openBridgeChannel: true
};

let theDispatch;

let connection;
let isJoined = false;
let room;
let roomName;

let theConnection;

let localTracks = [];
const remoteTracks = {};

function onRemoteTrack(track) {
  if (track.isLocal()) {
    return;
  }
  
  const participant = track.getParticipantId();

  theDispatch( ['jitsi/add-remote-track', participant, track] );
}


function onUserLeft(id) {
  theDispatch( ['jitsi/user-left', id] );
}

/**
 * That function is called when connection is established successfully
 */
function onConnectionSuccess() {
  console.log('fowler',connection);
}

/**
 * This function is called when the connection fail.
 */
function onConnectionFailed() {
    console.error('Connection Failed!');
}

/**
 * This function is called when we disconnect.
 */
function disconnect() {
    console.log('disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        onConnectionSuccess);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        disconnect);
}

function onLocalTracks(tracks) {
  theDispatch( ['jitsi/set-local-tracks', tracks] );
}

function init() {
  const initOptions = {
    disableAudioLevels: true
  };

  JitsiMeetJS.init(initOptions);

  connection = new JitsiMeetJS.JitsiConnection(null, null, options);

  theConnection = new Promise(function(resolve, reject) {
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      () => { resolve(connection); });
    
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      () => { reject('failed'); });
  });
  
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect);

  connection.connect();

  JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
    .then(onLocalTracks)
    .catch(error => {
        throw error;
    });
}

export function update( message, state ) {
  if (message[0] == 'jitsi/entered-room') {
    
    if (roomName == message[1]) return [ state, Cmd.none ];
    if (room) return [ state, Cmd.none ];
      
    roomName = message[1];

    if (room) room.leave();

    if (theConnection) {
      theConnection.then( (aConnection) => {
        room = connection.initJitsiConference(`rossrpg`, confOptions);
        
        room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
  
        room.on(
          JitsiMeetJS.events.conference.CONFERENCE_JOINED,
          () => { theDispatch( ['jitsi/conference-joined'] ) } );

        room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
        
        room.join();
      });
    }
                        
    return [ {...state, room: roomName }, Cmd.none ];
  }
  
  if (message[0] == 'jitsi/set-local-tracks') {
    return [ {...state, localTracks: message[1] }, Cmd.none ];
  }

  if (message[0] == 'jitsi/add-remote-track') {
    let participant = message[1];
    let track = message[2];

    let remoteTracks = state.remoteTracks;    
    if (remoteTracks === undefined) remoteTracks = {};
    if (!(participant in remoteTracks)) remoteTracks[participant] = [];

    remoteTracks[participant].push( track );
    return [ {...state, remoteTracks }, Cmd.none ];
  }

  if (message[0] == 'jitsi/user-left') {
    let participant = message[1];

    let remoteTracks = state.remoteTracks;    
    if (remoteTracks === undefined) remoteTracks = {};
    remoteTracks[participant] = [];
    return [ {...state, remoteTracks }, Cmd.none ];
  }

  if (message[0] == 'jitsi/conference-joined') {
    if (state.localTracks && room) {
      state.localTracks.forEach( (track) => {
        console.log(track);
        room.addTrack(track);
      });
    }

    return [ state, Cmd.none ];
  }

  return [ state, Cmd.none ];  
}
  
export function view( { state, dispatch } ) {
  if (theDispatch == undefined) {
    theDispatch = dispatch;
    init();
  }
  
  let theTracks = [] as JSX.Element[];
    
  if (state.localTracks) {
    state.localTracks.forEach( (track) => {
      if (track.getType() === 'video') {
        theTracks.push( <video autoplay="1" id="localVideo"
                        hook={{insert: (vnode) => track.attach(vnode.elm)}}/> );
      } else {
        theTracks.push( <audio autoplay="1" muted="true" id="localAudio"
                        hook={{insert: (vnode) => track.attach(vnode.elm)}}/> );
      }
    });
  }
  
  if (state.remoteTracks) {
    Object.keys(state.remoteTracks).forEach( (participant) => {
      let tracks = state.remoteTracks[participant];
      tracks.forEach( (track, idx) => {
        if (track.getType() === 'video') {
          theTracks.push( <video autoplay="1" id={`${participant}video${idx}`}
                          hook={{insert: (vnode) => track.attach(vnode.elm),
                                 destroy: (vnode) => track.detach(vnode.elm)}}/> );
        } else {
          theTracks.push( <audio autoplay="1" id={`${participant}audio${idx}`}
                          hook={{insert: (vnode) => track.attach(vnode.elm),
                                 destroy: (vnode) => track.detach(vnode.elm)}}/> );
        }
      });
    });
  }

  return <div>{theTracks} {state.room} </div>;
}

export default { view, update };
