import _N from '@wonderlandlabs/n';
import { Vector2 } from 'three';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import { Hexes } from '@wonderlandlabs/hexagony';
import chroma from 'chroma-js';
import Noise from 'simplex-noise';
import pixiStreamFactory from '../../utils/pixiStreamFactory';

import Sector from './Sector';

const ACCENT_2 = chroma(122, 29, 29).num();
const ACCENT_2_LIGHT = chroma(122, 29, 29).brighten(1).num();
const TEXT_COLOR = chroma(216, 210, 142).num();

const drawAddButtonRect = (rect, color) => {
  rect
    .clear()
    . beginFill(color)
    .drawRoundedRect(0, -30, 150, 30, 15)
    .endFill();
};

export default ({ size, galaxy }) => {
  const stream = pixiStreamFactory({ size });

  stream.addChild('matrix', null)
    .addSubStream('galaxyGroup', null)
    .addAction('initGalaxyGroup', (store) => {
      let g = store.get('galaxyGroup');
      if (!g) {
        const app = store.get('app');
        g = new PIXI.Container();

        app.stage.addChild(g);
        store.do.setGalaxyGroup(g);
      }

      g.removeChildren();
    })
    .addSubStream('buttonGroup', null)
    .addChild('noise')
    .addAction('initNoise', (store) => {
      const gal = store.get('galaxy');
      const seed = _.get(galaxy, 'id', 'so long and thanks for all the fish');
      store.do.setNoise(new Noise(seed));
    })
    .addAction('initButtonGroup', (store) => {
      let g = store.get('buttonGroup');
      if (!g) {
        const app = store.get('app');
        g = new PIXI.Container();

        const height = stream.get('height');
        g.position = { x: 0, y: height };

        app.stage.addChild(g);
        store.do.setButtonGroup(g);
      }
    })
    .addAction('positionGroups', (store) => {
      store.do.initGalaxyGroup();
      store.do.initButtonGroup();
      try {
        const g = store.get('galaxyGroup');
        const bg = store.get('buttonGroup');
        const width = stream.get('width');
        const height = stream.get('height');

        const scale = _N(width).min(height).div(20).value;
        stream.do.setMatrix(new Hexes({ scale, pointy: true }));

        const center = new Vector2(width, height);
        center.multiplyScalar(0.5);

        g.position = center;
        bg.position = { x: 0, y: height };
      } catch (err) {
        console.log('error on positionGroups', err);
      }
    })
    .addSubStream('galaxy', galaxy)
    .addSubStream('sectors', [], 'array')
    .addAction('redraw', (store) => {
      store.do.positionGroups();
      stream.do.drawGrid();
      stream.do.drawAddGalaxyButton();
    })
    .addAction('drawGrid', (store) => {
      try {
        const matrix = store.get('matrix');
        const g = store.get('galaxyGroup');
        const width = stream.get('width');
        const height = stream.get('height');

        const center = new Vector2(width, height);
        center.multiplyScalar(0.5);
        // eslint-disable-next-line arrow-body-style
        const galaxyHexes = matrix.floodQuery((point, coord) => {
          return _N(coord.x).abs().max(_N(coord.y).abs()).max(_N(coord.z).abs()).value <= 10;
        }, -center.x, -center.y, center.x, center.y, false);

        const gSectors = galaxyHexes.map((coord) => new Sector(coord, matrix, store));

        store.do.setSectors(gSectors);

        g.removeChildren();
        store.do.drawGridSectors();
      } catch (err) {
        console.log('error on drawGrid:', err);
      }
    })
    .addChild('hasGalaxy', false, 'boolean')
    .addChild('densityMap', new Map())
    .addAction('addGalaxy', (store) => {
      store.do.initNoise();
      const noise = store.get('noise');
      const secs = store.get('sectors');
      const densityMap = store.get('densityMap');

      secs.forEach((sector) => {
        const value = noise.noise3D(sector.xDec, sector.yDec, sector.zDec);
        densityMap.set(sector.id, _N(value).plus(1).div(2).value);
      });
      store.do.setHasGalaxy(true);
    }, true)
    .addAction('drawGridSectors', (store) => {
      store.get('sectors').forEach((sector) => {
        sector.render();
      });
    })
    .addAction('drawAddGalaxyButton', (store) => {
      try {
        const g = store.get('buttonGroup');
        const hasGalaxy = store.get('hasGalaxy');
        g.removeChildren();

        if (!hasGalaxy) {
          const button = new PIXI.Container();
          g.addChild(button);
          button.position = { x: 40, y: -80 };
          button.interactive = true;

          const rect = new PIXI.Graphics();
          drawAddButtonRect(rect, ACCENT_2);
          button.addChild(rect);
          const t = new PIXI.Text('Add Galaxy', {
            fill: TEXT_COLOR,
            fontFamily: 'Helvetica',
            fontSize: 18,
          });
          t.position = { x: 25, y: -27 };
          button.addChild(t);

          button.on('mouseover', () => {
            drawAddButtonRect(rect, ACCENT_2_LIGHT);
          });
          button.on('mouseout', () => {
            drawAddButtonRect(rect, ACCENT_2);
          });
          button.on('click', () => {
            store.do.addGalaxy().then(() => {
              store.do.redraw();
            });
          });
        }
      } catch (err) {
        console.log('error on drawAddGalaxyButton', err);
      }
    });

  stream.watch('galaxy', 'redraw');

  stream.on('initApp', () => {
    stream.do.initGalaxyGroup();
    stream.do.initButtonGroup();
  });

  stream.on('resized', () => {
    stream.do.positionGroups();
    stream.do.redraw();
  });

  return stream;
};
