import Snabbdom from 'snabbdom-pragma';

import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas);

export function picture(name) {
  let theIcon = icon({ prefix: 'fas', iconName: name });
  let thePicture = <i innerHTML={theIcon.html[0]}></i>;
  return thePicture;
}

export default picture;

