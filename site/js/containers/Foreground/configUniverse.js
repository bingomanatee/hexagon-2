import _ from 'lodash';
import { Hexes } from '@wonderlandlabs/hexagony';
import * as PIXI from 'pixi.js';
import Hex from './Hex';

export default (stream) => {
  stream
    .addChild('universeGroup')
    .addChild('mouseHex')
    .addChild('hexMap', new Map())
    .addChild('hexagons', new Hexes({ scale: 100, pointy: true }))
    .addAction('initUniverse', (store) => {
      const ug = new PIXI.Container();
      const app = store.get('app');
      app.stage.addChild(ug);
      store.do.setUniverseGroup(ug);
    })
    .addSubStream('currentGalaxy', null)
    .addAction('updateCurrentGalaxy', (store) => {
      const name = store.get('currentGalaxyName');
      if (!name) {
        return;
      }
      console.log('looking for galaxy ', name);

      const hexes = store.get('hexagons');

      const galaxy = store.get('currentGalaxy');
      if (_.get(galaxy, 'cubeString') === name) {
        return;
      }


      const iter = hexes.grid.getTileIterator();
      while (!iter.done) {
        const hex = iter.next();
        if (!hex) {
          break;
        }
        if (hex.cubeString === name) {
          console.log('found galaxy', name, ':', hex);
          store.do.setCurrentGalaxy(hex);
          break;
        }
      }
    })
    .addAction('drawHexes', (store) => {
      const matrix = store.get('hexagons');
      const ug = store.get('universeGroup');

      const width = store.get('width');
      const height = store.get('height');

      const hexes = matrix.floodRect(0, 0, width, height);
      const hexMap = store.get('hexMap');

      hexes.forEach((coord) => {
        const g = new PIXI.Graphics();
        const hex = new Hex(coord, matrix, g);
        hexMap.set(hex.id, hex);

        g.on('click', () => {
          store.do.setCurrentGalaxy(hex);
          store.get('history').push(`/galaxy/${hex.id}`);
        });

        ug.addChild(g);
        hex.drawOut();
      });
      store.do.setMouseHex(null);
    })
    .addAction('updateHex', (store) => {
      const x = store.get('x');
      const y = store.get('y');
      const matrix = store.get('hexagons');
      const hexMap = store.get('hexMap');
      const mouseHex = store.get('mouseHex');

      const nearestCoord = matrix.nearestHex(x, y);
      const id = nearestCoord.toString();
      const nearHex = hexMap.get(id);

      if (nearHex !== mouseHex) {
        if (mouseHex) mouseHex.drawOut();
        if (nearHex) {
          nearHex.drawOver();
        }
        store.do.setMouseHex(nearHex);
      }
    })
    .addAction('restartHex', (store) => {
      const ug = store.get('universeGroup');
      const hexMap = store.get('hexMap');
      hexMap.clear();
      store.do.setMouseHex(null);
      ug.interactiveChildren = true;
      ug.removeChildren();

      store.do.drawHexes();
    });
};
