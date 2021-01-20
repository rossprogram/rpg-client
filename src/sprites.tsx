import Adam from '../public/images/sprites/Adam_16x16.png';
import Alex from '../public/images/sprites/Alex_16x16.png';
import Amelia from '../public/images/sprites/Amelia_16x16.png';
import Bob from '../public/images/sprites/Bob_16x16.png';
import Kirk from '../public/images/sprites/Bouncer_16x16.png';
import Martin from '../public/images/sprites/Conference_man_16x16.png';
import Mary from '../public/images/sprites/Conference_woman_16x16.png';
import Dan from '../public/images/sprites/Dan_16x16.png';
import Edward from '../public/images/sprites/Edward_16x16.png';
import Abby from '../public/images/sprites/Kid_Abby_16x16.png';
import Oscar from '../public/images/sprites/Kid_Oscar_16x16.png';
import Lucy from '../public/images/sprites/Lucy_16x16.png';
import Molly from '../public/images/sprites/Molly_16x16.png';
import Josh from '../public/images/sprites/Old_man_Josh_16x16.png';
import Jenny from '../public/images/sprites/Old_woman_Jenny_16x16.png';
import Pier from '../public/images/sprites/Pier_16x16.png';
import Rob from '../public/images/sprites/Rob_16x16.png';
import Roki from '../public/images/sprites/Roki_16x16.png';
import Samuel from '../public/images/sprites/Samuel_16x16.png';

const { fonts, renderPixels } = require('js-pixel-fonts');

let srcs = {
  Adam ,
  Alex ,
  Amelia ,
  Bob ,
  Kirk ,
  Martin ,
  Mary ,
  Dan ,
  Edward ,
  Abby ,
  Oscar ,
  Lucy ,
  Molly ,
  Josh ,
  Jenny ,
  Pier ,
  Rob ,
  Roki ,
  Samuel };

let people = {};

for (const [name, src] of Object.entries(srcs)) {
  let image = new Image();
  image.src = src;
  people[name] = image;
}

let nametags = {};

export function drawSprite( ctx, sprite ) {
  let person = people[sprite.image];

  let x = sprite.x;
  let y = sprite.y;

  let direction = 0;
  if ((sprite.sx > 0) && (sprite.sy == 0)) direction = 0;
  if ((sprite.sx < 0) && (sprite.sy == 0)) direction = 2;
  if ((sprite.sy > 0) && (sprite.sx == 0)) direction = 3;
  if ((sprite.sy < 0) && (sprite.sx == 0)) direction = 1;  

  let sx = direction * 16;
  let sy = 0;

  let walking = (sprite.dx * sprite.dx + sprite.dy * sprite.dy > 0.01);
  if (walking) {
    sy = 32*2;
    sx = (Math.floor(sprite.f) + direction * 6 ) * 16;
  }
  
  ctx.drawImage( person, sx, sy, 16, 32, Math.round(x), Math.round(y) - 32, 16, 32);

  if (sprite.name) {
    const name = sprite.name;
  
    if (nametags[name]) {
      let tx = Math.round(x + 8 - nametags[name].black.width / 2);
      let ty =  Math.round(y) - 32;
      for( let ox of [-1,0,1] ) {
        for( let oy of [-1,0,1] ) {
          ctx.drawImage( nametags[name].black, tx + ox, ty + oy );
        }
      }
      ctx.drawImage( nametags[name].white, tx, ty );
    } else {
      let image = renderPixels( name, fonts.sevenPlus );
  
      const whiteImage = ctx.createImageData( image[0].length, image.length );
      const blackImage = ctx.createImageData( image[0].length, image.length );  

      for (let i = 0; i < whiteImage.data.length; i += 4) {
        let ix = Math.floor(i / 4) % image[0].length;
        let iy = Math.floor((i / 4) / image[0].length);
        let alpha = image[iy][ix] * 255;
    
        whiteImage.data[i + 0] = 255;
        whiteImage.data[i + 1] = 255;
        whiteImage.data[i + 2] = 255;
        whiteImage.data[i + 3] = alpha;
        blackImage.data[i + 0] = 0;
        blackImage.data[i + 1] = 0;
        blackImage.data[i + 2] = 0;
        blackImage.data[i + 3] = alpha;
      }

      createImageBitmap( whiteImage ).then( (whiteBitmap) => {
        createImageBitmap( blackImage ).then( (blackBitmap) => {      
          nametags[name] = { white: whiteBitmap, black: blackBitmap };
        });
      });
    }
  }
}
