import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';
import { Link } from './router';

import { drawMap, collisionType } from './tiles';
import keyboard from './keyboard';

let theState;
let theDispatch;

let theRoom = 0;

let previousTime;

let cameraX = 500;
let cameraY = 700;
let sprites = [ { image: 'Mary', x: 660, y: 810, sx: 0, sy: 0, f: 0, dx: 0, dy: 0 } ];

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
  if (keyboard.isDownPressed()) { me.dy += elapsed/factor; me.sy = 1; me.sx = 0; }
  if (keyboard.isUpPressed()) { me.dy -= elapsed/factor; me.sy = -1; me.sx = 0; }
  if (keyboard.isRightPressed()) { me.dx += elapsed/factor; me.sx = 1; me.sy = 0; }
  if (keyboard.isLeftPressed()) { me.dx -= elapsed/factor; me.sx = -1; me.sy = 0; }

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
    for( let offset of [-1,1,-2,2,-3,3,-4,4, -5, 5] ) {
      let newX = me.x + offset;
      if (isCollided(newX, newY)) {      
        me.x = newX;
        me.y = newY;
        break;
      }
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
  const ctx = canvas.getContext('2d');
  
  let px = me.x + 8;
  let py = me.y - 10;

  let goalCameraX = cameraX;
  let goalCameraY = cameraY;  
      
  let cameraMargin = 0.25;
  if ((px - cameraX) < (cameraMargin * canvas.width)) {
    goalCameraX = px - cameraMargin * canvas.width;
  }
  if ((px - cameraX) > ((1.0 - cameraMargin) * canvas.width)) {
    goalCameraX = px - (1.0 - cameraMargin) * canvas.width;
  }
  if ((py - cameraY) < (cameraMargin * canvas.height)) {
    goalCameraY = py - cameraMargin * canvas.height;
  }
  if ((py - cameraY) > ((1.0 - cameraMargin) * canvas.height)) {
    goalCameraY = py - (1.0 - cameraMargin) * canvas.height;
  }    

  cameraX = (cameraX + goalCameraX) / 2.0;
  cameraY = (cameraY + goalCameraY) / 2.0;

  ctx.resetTransform();
  ctx.translate( Math.round(-cameraX), Math.round(-cameraY) );

  ////////////////////////////////////////////////////////////////
  // Draw everything
  drawMap(ctx, sprites);

  // Repeat if there is still a canvas to play on
  if (document.getElementById('canvas'))
      window.requestAnimationFrame( draw );
}


export function update( message, state ) {
  theState = state;

  if (message[0] == 'entered-room') {
    return [ {...state, room: message[1] }, Cmd.none ];
  }
  
  if (message[0] == 'set-realm') {
    return [ {...state, realm: message[1] }, Cmd.none ];
  }

  if ((message[0] == 'window-resize') || (message[0] == 'canvas-inserted')) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let newState = state;

    if (message[0] == 'canvas-inserted') {
      document.body.style.overflow = "hidden";
      newState = {...state, canvas: document.getElementById('canvas') };
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

    window.requestAnimationFrame(draw);
    
    return [ newState, Cmd.none ];
  }

  return [ state, Cmd.none ];
}

export function init(state, route) {
  return [{...state, realm: false}, async function* () {
    try {
      let realm = await Server.getRealm( state.token, route.id );
      yield [ 'set-realm', realm ];
    } catch (error) {
      yield [ 'error', error ];
    }
  }];
}

export function view( { state, dispatch } ) {
  if (state.realm) {
    theDispatch = dispatch;
    
    return <canvas id="canvas" style={{position:"absolute",top:"0px",left:"0px","z-index":-1}} width="100" height="100" hook={{insert: () => dispatch(['canvas-inserted']), destroy: () => document.body.style.overflow = 'initial'}}></canvas>;
  }
  
  return <div class={{container: true}}>
    <h1>Realm</h1>
    <p>Loading&hellip;</p>
    </div>;  
}

export default { view, init, update };
