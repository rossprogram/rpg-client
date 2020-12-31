////////////////////////////////////////////////////////////////
// Load a bunch of CSS
import './scss/app.scss';

////////////////////////////////////////////////////////////////
// Display a banner
import { version } from '../package.json';
console.log("This is the Ross RPG, version",version);

////////////////////////////////////////////////////////////////
// the elm architecture lifecycle, via snabbdom

import Snabbdom from 'snabbdom-pragma';

import { init } from 'snabbdom/init'
import { classModule } from 'snabbdom/modules/class'
import { propsModule } from 'snabbdom/modules/props'
import { styleModule } from 'snabbdom/modules/style'
import { eventListenersModule } from 'snabbdom/modules/eventlisteners'

var patch = init([ // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
]);

// the initial container
var vnode;
let oldState = window.localStorage.getItem('state');

let state;
if (oldState)
  state = JSON.parse(oldState);

function repaint() {
  if (vnode === undefined)
    vnode = patch(document.body, app.view({state, dispatch}));
  else
    vnode = patch(vnode, app.view({state, dispatch}));
}

window.onpopstate = function() {
  dispatch( ['navigate-to', window.location.pathname] );
};

import app from './app';

function debounce(func, wait) {
  var timeout;
  return function() {
    var later = function() {
      timeout = null;
      func();
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const repaintSlowly = debounce( repaint, 10 );

function update(stateAndCommand) {
  state = stateAndCommand[0];
  window.localStorage.setItem('state', JSON.stringify(state));
  
  //window.requestAnimationFrame( repaint );
  repaintSlowly();
  
  let command = stateAndCommand[1];

  (async () => {
    for await (const message of command() ) {
      dispatch(message);
      //window.requestAnimationFrame( repaint );
      repaintSlowly();
    }
  })();
}

export function dispatch(message) {
  update( app.update(message, state) );
}

update( app.init(state) );


