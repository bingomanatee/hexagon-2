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
    .addAction('updateCurrentGalaxy', (store, secondTry) => {
      const hexMap = store.get('hexMap');
      const name = store.get('currentGalaxyName');
      if (!name) {
        return;
      }
      console.log('looking for galaxy ', name);
      if (hexMap.has(name)) {
        store.do.setCurrentGalaxy(hexMap.get(name));
        console.log('choosing current galaxy ', hexMap.get(name));
      } else if (!secondTry) {
        setTimeout(() => {
          stream.do.updateCurrentGalaxy(true);
        }, 1000);
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
          console.log('hex click:', hex);
          store.get('history').push(`/galaxy/${hex.id}`);
        });

        g.on('mouseover', () => hex.drawOver());
        g.on('mouseout', () => hex.fade());

        ug.addChild(g);
        hex.drawOut();
      });
      store.do.setMouseHex(null);
    })
    .addAction('tryToLoadGalaxyFromName', (store) => {
      store.do.updateCurrentGalaxy();
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
