let up = false;
let down = false;
let left = false;
let right = false;
let shifted = false;

function keyDownHandler(event) {
  var keyCode = event.keyCode;
  switch (keyCode) {
  case 68: //d
  case 39:
    right = true;
    break;
  case 83: //s
  case 40:
    down = true;
    break;
  case 65: //a
  case 37:
    left = true;
    break;
  case 87: //w
  case 38:
    up = true;
    break;
  case 16:
    shifted = true;
    break;
  }
}

function keyUpHandler(event) {
  var keyCode = event.keyCode;

  switch (keyCode) {
  case 68: //d
  case 39:
    right = false;
    break;
  case 83: //s
  case 40:
    down = false;
    break;
  case 65: //a
  case 37:
    left = false;
    break;
  case 87: //w
  case 38:
    up = false;
    break;
  case 16:
    shifted = false;
    break;        
  }
}

document.addEventListener("keydown",keyDownHandler, false);
document.addEventListener("keyup",keyUpHandler, false);	

export function isUpPressed() {
  return up;
}

export function isDownPressed() {
  return down;
}

export function isRightPressed() {
  return right;
}

export function isLeftPressed() {
  return left;
}

export function isShiftPressed() {
  return shifted;
}

export default { isUpPressed, isDownPressed, isRightPressed, isLeftPressed, isShiftPressed };
