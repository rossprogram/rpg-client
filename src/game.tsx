import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';
import { Link } from './router';

import { drawMap, collisionType } from './tiles';
import keyboard from './keyboard';
import { applyCameraTransform } from './camera';
let theState;
let theDispatch;

let theRoom = 0;

let previousTime;

let sprites = [ { image: 'Mary', x: 660, y: 810, sx: 0, sy: 0, f: 0, dx: 0, dy: 0 } ];
let remoteSprites = {};

let myShadow = { image: 'Mary', x: 0, y: 0, sx: 0, sy: 0, f: 0, dx: 0, dy: 0 };

function processPhysics( elapsed, me ) {
  let factor = 20.0;
  
  me.dx /= 1.3;
  me.dy /= 1.3;
  
  const maxspeed = 1.84;

  let norm = Math.sqrt(me.dx*me.dx + me.dy*me.dy);
  if (norm > maxspeed) {
    me.dx /= norm / maxspeed ;
    me.dy /= norm / maxspeed ;
  }

  let speed = Math.sqrt(me.dx*me.dx + me.dy*me.dy);
  me.f += speed * elapsed * 0.01;
  me.f = (me.f + 36) % 6;

  // Collision detection and reactions
  let newX = me.x + me.dx * elapsed * 0.05;
  let newY = me.y + me.dy * elapsed * 0.05;

  let isCollided = function ( x, y ) {
    return (collisionType(x + 0.5, y) > 0) && (collisionType(x + 15.5, y) > 0);
  };
  
  if (isCollided(newX, me.y)) {
    me.x = newX;
  }

  if (isCollided(me.x, newY)) {
    me.y = newY;
  } else {
    // shove to the side if we could move forward after a strafe
    for( let offset = 1; offset < 30; offset++ ) {
      for( let signum of [-1,1] ) {
        if (isCollided(me.x + signum*offset / 2.0, newY)) {
          const shove = elapsed/factor;
          me.dx += signum * shove;
          break;
        }
      }
    }
  }
}

function draw(time) {
  ////////////////////////////////////////////////////////////////  
  // Compute time since the previous frame
  let elapsed = 0;
  
  if (previousTime) {
    elapsed = time - previousTime;
  }
  previousTime = time;

  ////////////////////////////////////////////////////////////////
  // Physics for walking
  let me = sprites[0];

  let factor = 20.0;
  if (keyboard.isDownPressed()) { me.dy += elapsed/factor; if (!keyboard.isShiftPressed()) { me.sy = 1; me.sx = 0; } }
  if (keyboard.isUpPressed()) { me.dy -= elapsed/factor; if (!keyboard.isShiftPressed()) { me.sy = -1; me.sx = 0; } }
  if (keyboard.isRightPressed()) { me.dx += elapsed/factor; if (!keyboard.isShiftPressed()) { me.sx = 1; me.sy = 0; } }
  if (keyboard.isLeftPressed()) { me.dx -= elapsed/factor; if (!keyboard.isShiftPressed()) { me.sx = -1; me.sy = 0; } }

  remoteSprites['me'] = me;
  Object.values( remoteSprites ).forEach( (sprite) => {
    console.log( sprite );
    processPhysics( elapsed, sprite );
  });

  ////////////////////////////////////////////////////////////////
  // Update peers
  let socket = theState.socket;
  
  if (socket && socket.readyState == 1) {
    if ((Math.abs(Math.round(myShadow.x) - Math.round(me.x)) > 1.0) ||
        (Math.abs(Math.round(myShadow.y) - Math.round(me.y)) > 1.0)) {
      socket.send(JSON.stringify({ type: 'update', parameters: [me] }));
      Object.assign( myShadow, me );
    }
  }
  
  ////////////////////////////////////////////////////////////////
  // Update room
  
  if (collisionType(me.x + 8, me.y) !== theRoom) {
    theRoom = collisionType(me.x + 8, me.y);
    theDispatch( ['entered-room', theRoom] );
  }

  ////////////////////////////////////////////////////////////////
  // Update camera
  const canvas = theState.canvas;

  // If your application uses canvas and doesn’t need a transparent
  // backdrop, set the alpha option to false when creating a drawing
  // context with HTMLCanvasElement.getContext(). This information can
  // be used internally by the browser to optimize rendering.
  //
  // cf. https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
  const ctx = canvas.getContext('2d', { alpha: false });
  
  let px = me.x + 8;
  let py = me.y - 10;
  applyCameraTransform( ctx, { x: px, y: py } );
  
  ////////////////////////////////////////////////////////////////
  // Draw everything
  drawMap(ctx, Object.values(remoteSprites));

  // Repeat if there is still a canvas to play on
  if (theState.canvas == document.getElementById('canvas'))
    window.requestAnimationFrame( draw );
}

export function update( message, state ) {
  theState = state;

  if (message[0] == 'entered-room') {
    return [ {...state, room: message[1] }, Cmd.none ];
  }
  
  if ((message[0] == 'window-resize') || (message[0] == 'canvas-inserted')) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let newState = state;

    if (message[0] == 'canvas-inserted') {
      document.body.style.overflow = "hidden";
      newState = {...state, canvas: document.getElementById('canvas') };
      window.requestAnimationFrame(draw);
    }
    
    if (newState.canvas) {
      var dpr = window.devicePixelRatio || 1;
      let ratio = Math.round(dpr * 1.3);
      
      newState.canvas.width = width / ratio;
      newState.canvas.height = height / ratio;
      newState.canvas.style.width = `${width}px`;
      newState.canvas.style.height = `${height}px`;      
    }
      
    theState = newState;

    return [ newState, Cmd.none ];
  }

  return [ state, Cmd.none ];
}

export function init(state) {
  const WS_URL = process.env.WS_URL;

  // Create WebSocket connection.
  if (WS_URL) {
    const socket = new WebSocket(WS_URL);

    // Connection opened
    socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify({ token: state.token }));
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
      let payload = JSON.parse(event.data);
      if (payload.type == 'update') {
        let state = payload.parameters[0];
        
        // FIXME: if this a NEW sprite, then we should send our own state to the server
        remoteSprites[state.uuid] = state;
      }
    });

    return [{...state, socket }, async function* () {
    }];
  }

  return [{...state}, async function* () {
  }];
}

export function view( { state, dispatch } ) {
  theDispatch = dispatch;
    
  return <canvas id="canvas" style={{position:"absolute",top:"0px",left:"0px","z-index":-1}} width="100" height="100" hook={{insert: () => dispatch(['canvas-inserted']), destroy: () => document.body.style.overflow = 'initial'}}></canvas>;
}

export default { view, init, update };
