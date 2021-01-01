import interiorsJson from '../public/maps/interiors.json';
import interiorsImage from '../public/images/tiles/interiors_16x16.png';
let interiors = { ...interiorsJson, image: new Image() };
interiors.image.src = interiorsImage;

import itemsJson from '../public/maps/items.json';
import itemsImage from '../public/images/tiles/office_interiors_16x16.png';
let items = { ...itemsJson, image: new Image() };
items.image.src = itemsImage;

import officeFloorsJson from '../public/maps/office-floors.json';
import officeFloorsImage from '../public/images/tiles/office_walls_floors_16x16.png';
let officeFloors = { ...officeFloorsJson, image: new Image() };
officeFloors.image.src = officeFloorsImage;

import tilesetsJson from '../public/maps/tilesets.json';
import tilesetsImage from '../public/images/tiles/tilesets_16x16.png';
let tilesets = { ...tilesetsJson, image: new Image() };
tilesets.image.src = tilesetsImage;

let theTiles = { "interiors.tsx": interiors,
                 "items.tsx": items,
                 "tilesets.tsx": tilesets,
                 "office-floors.tsx": officeFloors };

import theMap from '../public/maps/map.json';

let theLayers : Array<any> = [];

for (let layer of theMap.layers) {
  let data = layer.data;
  let array = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  let result = new Uint32Array(array.buffer);
  theLayers.push({...layer, data: result});
}

function gidToTileset( map, gid ) {
  let start;

  for( let t of map.tilesets ) {
    if (t.firstgid > gid) break;
    start = t; 
  }

  if (start) {
    let tileset = theTiles[start.source];
    
    if (tileset) {
      return [tileset, gid - start.firstgid];
    }

    return [tileset, 0];
  }

  return [undefined, 0];
}

function drawTile(ctx, tileset, id, x, y) {
  let width = tileset.tilewidth + tileset.spacing;
  let height = tileset.tileheight + tileset.spacing;  

  let rows = Math.floor((tileset.imagewidth - 2*tileset.margin) / tileset.tilewidth);

  let tx = id % rows;
  let ty = Math.floor(id / rows);
  
  let sx = tileset.margin + width * tx;
  let sy = tileset.margin + height * ty;

  ctx.drawImage( tileset.image, sx, sy,
                 tileset.tilewidth, tileset.tileheight,
                 x, y,
                 tileset.tilewidth, tileset.tileheight);                 
}


function drawLayer( ctx, map, layer ) {
  for(let x = 0; x < layer.width; x++ ) {
    for(let y = 0; y < layer.height; y++ ) {
      let gid = layer.data[x+y*layer.width];
      let [tileset, id] = gidToTileset(map, gid);
      if (tileset) {
        let ox = layer.offsetx || 0;
        let oy = layer.offsety || 0;
        drawTile( ctx, tileset, id,
                  x*map.tilewidth + ox,
                  y*map.tileheight + oy);
      }
    }
  }
}

export function drawMap(ctx) {
  //drawTile( ctx, items, 118, 100,100);
  drawLayer( ctx, theMap, theLayers[0] );
  //drawLayer( ctx, theMap, theLayers[4] );
  drawLayer( ctx, theMap, theLayers[1] );
  drawLayer( ctx, theMap, theLayers[2] );
  drawLayer( ctx, theMap, theLayers[3] );  


  //  ctx.fillStyle = 'blue';
  //ctx.fillRect(20, 10, 150, 100);
}
