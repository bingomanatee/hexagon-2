import chroma from 'chroma-js';
import SimplexNoise from 'simplex-noise';
import _N from '@wonderlandlabs/n';
import _ from 'lodash';
import { Hexagons } from '@wonderlandlabs/hexagone';
import { Vector2, Vector3 } from 'three';
import * as PIXI from 'pixi.js';

const transparent = chroma(0, 0, 0).num();

export default (stream) => {
  stream
    .addChild('universeGroup')
    .addChild('mouseHex')
    .addChild('hexagons', new Hexagons(100, 20, false))
    .addAction('initUniverse', (store) => {
      const ug = new PIXI.Container();
      const app = store.get('app');
      // const width = store.get('width');
      // const height = store.get('height');
      // cc.transform.pivot = { x: width / 2, y: height / 2 };
      app.stage.addChild(ug);
      store.do.setUniverseGroup(ug);
    })
    .addAction('drawHexes', (store) => {
      const hexes = store.get('hexagons');
      const ug = store.get('universeGroup');

      const iter = hexes.grid.getTileIterator();
      while (!iter.done) {
        const hex = iter.next();
        if (!hex) {
          break;
        }
        hexes.process(hex);
        hex.x = Math.round(hex.x);
        hex.y = Math.round(hex.y);

        const g = new PIXI.Graphics();
        g.interactive = true;
        g.interactiveChildren = true;
        const points = hex.points;

        hex._pColor = chroma(255, _.random(0, 255), 0).num();
        const first = points[0];

        hex.drawOver = () => {
          g.clear();
          g.beginFill(hex._pColor)
            .moveTo(first.x, first.y);
          points.slice(1).forEach(({ x, y }) => g.lineTo(x, y));
          g.endFill();
          g.calculateBounds();
        };
        hex.drawOut = () => {
          g.clear();
          g.beginFill(transparent, 0.1)
            .moveTo(first.x, first.y);
          points.slice(1).forEach(({ x, y }) => g.lineTo(x, y));
          g.endFill();

          g.lineStyle(1, hex._pColor, 0.1, 0.5, false)
            .moveTo(first.x, first.y);
          points.slice(1).forEach(({ x, y }) => g.lineTo(x, y));
          g.calculateBounds();
        };
        hex.graphics = g;
        ug.addChild(g);
        hex.drawOut();
      }
      store.do.setMouseHex(
        hexes.getTile(
          _N(_.get(hexes, 'grid.width', 0))
            .div(2).floor().value,
          _N(_.get(hexes, 'grid.height', 0))
            .div(2).floor().value,
        ),
      );
    })
    .addAction('updateHex', (store) => {
      const x = store.get('x');
      const y = store.get('y');
      const xyPoint = new Vector2(x, y);
      const nearHex = store.get('mouseHex');
      const hexes = store.get('hexagons');
      let currentBest = nearHex;
      let limit = 0;
      do {
        const neighbors = hexes.grid.getNeighboursById(currentBest.id);
        let lastDist = xyPoint.distanceToSquared(currentBest);
        const newNearHex = neighbors
          .reduce((best, candidate) => {
            if (!best) {
              return candidate;
            }
            const canDist = xyPoint.distanceToSquared(candidate);
            if (canDist < lastDist) {
              lastDist = canDist;
              return candidate;
            }
            return best;
          }, currentBest);
        if (currentBest !== newNearHex) {
          currentBest = newNearHex;
        } else {
          break;
        }
        limit += 1;
      } while (limit < 10);

      if (currentBest !== nearHex) {
        console.log('moved near hex to ', currentBest);
        nearHex.drawOut();
        currentBest.drawOver();
        store.do.setMouseHex(currentBest);
      }
    })
    .addAction('restartHex', (store) => {
      const ug = store.get('universeGroup');
      ug.interactiveChildren = true;
      ug.removeChildren();

      const width = store.get('width');
      const height = store.get('height');

      const minDim = Math.min(width, height);

      const hexScale = minDim / 20;

      const hexes = new Hexagons(hexScale, 30, false);
      store.do.setHexagons(hexes);
      store.do.drawHexes();
    });
};
