import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Server from './api';
import { Link } from './router';

import { drawMap } from './tiles';
import { drawSprite } from './sprites';
import keyboard from './keyboard';

let theState;

let previousTime;

let sprites = [ { image: 'Mary', x: 600, y: 800, sx: 0, sy: 0, f: 0, dx: 0, dy: 0 } ];

function draw(time) {
  let elapsed = 0;
  
  if (previousTime) {
    elapsed = time - previousTime;
  }
  previousTime = time;

  let me = sprites[0];

  if (keyboard.isDownPressed()) { me.dy += elapsed/20.0; me.sy = 1; me.sx = 0; }
  if (keyboard.isUpPressed()) { me.dy -= elapsed/20.0; me.sy = -1; me.sx = 0; }
  if (keyboard.isRightPressed()) { me.dx += elapsed/20.0; me.sx = 1; me.sy = 0; }
  if (keyboard.isLeftPressed()) { me.dx -= elapsed/20.0; me.sx = -1; me.sy = 0; }

  me.dx /= 1.9;
  me.dy /= 1.9;
  
  const maxspeed = 3.2;
  me.dx = Math.min(Math.max(me.dx, -maxspeed), maxspeed);
  me.dy = Math.min(Math.max(me.dy, -maxspeed), maxspeed);

  let norm = Math.sqrt(me.dx*me.dx + me.dy*me.dy);
  if (norm > maxspeed) {
    me.dx /= norm / maxspeed ;
    me.dy /= norm / maxspeed ;
  }

  let speed = Math.sqrt(me.dx*me.dx + me.dy*me.dy);
  me.f += speed * elapsed * 0.01;
  me.f %= 6;

  me.x += me.dx * elapsed * 0.03;
  me.y += me.dy * elapsed * 0.03;

  const canvas = theState.canvas;
  const ctx = canvas.getContext('2d');
  
  ctx.resetTransform();
  ctx.translate( -500, -700 );

  drawMap(ctx);
  drawSprite( ctx, me );
  
  if (document.getElementById('canvas'))
      window.requestAnimationFrame( draw );
}


export function update( message, state ) {
  theState = state;

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
    return <canvas id="canvas" style={{position:"absolute",top:"0px",left:"0px","z-index":-1}} width="100" height="100" hook={{insert: () => dispatch(['canvas-inserted']),                                                       destroy: () => document.body.style.overflow = 'initial'}}></canvas>;
  }
  
  return <div class={{container: true}}>
    <h1>Realm</h1>
    <p>Loading&hellip;</p>
    </div>;  
}

export default { view, init, update };
