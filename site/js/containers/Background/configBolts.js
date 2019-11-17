import { Vector2 } from 'three';
import _ from 'lodash';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _N from '@wonderlandlabs/n';

const MAX_BOLT_DELAY = 5000;
const MIN_BOLT_LIFE = 100;
const MAX_BOLT_LIFE = 600;
const BOLT_FADE = 1 / 3;
const LIGHT_MIN_DIST = 20;

const randomPoint = (store) => {
  const width = store.get('width');
  const height = store.get('height');

  return new Vector2(_.random(0, width), _.random(0, height));
};

const smoothPoints = (series) => series.map((point, i) => {
  if (i > 0 && i < series.length - 1) {
    const neighbors = series.slice(i - 1, i + 1);
    const x = _(neighbors)
      .map('x')
      .mean();
    const y = _(neighbors)
      .map('y')
      .mean();
    return new Vector2(x, y);
  }
  return point;
});

const splitPoints = (series) => _(series)
  .map((point, i) => {
    if (i === 0) {
      return point;
    }
    const prev = series[i - 1];
    if (prev.distanceToSquared(point) < LIGHT_MIN_DIST) {
      return point;
    }
    const mid = point.clone().lerp(prev, 0.5);
    const displace = _N(point.distanceTo(prev)).div(3).value;
    mid.x += _.random(-displace, displace);
    mid.y += _.random(-displace, displace);
    return [point, mid];
  })
  .flattenDeep()
  .value();


const boltPoints = (...series) => {
  const smoothed = smoothPoints(series);
  const split = splitPoints(smoothed);
  const maxDistance = _(split)
    .map((point, i) => {
      if (i === 0) {
        return 0;
      }
      return point.distanceTo(split[i - 1]);
    })
    .max();
  if (maxDistance < LIGHT_MIN_DIST) {
    return split;
  }
  return boltPoints(...split);
};

export default function configBolts(stream) {
  stream
    .addChild('bolts', new Set())
    .addChild('lightGroup')
    .addAction('initBolts', (store) => {
      const app = store.get('app');
      const lc = new PIXI.Container();
      store.do.setLightGroup(lc);
      app.stage.addChild(lc);
    })
    .addAction('resetBolts', (store) => {
      const bolt = store.get('bolts');
      const lightGroup = store.get('lightGroup');
      lightGroup.removeChildren();
      bolt.clear();
    })
    .addAction('makeBolt', (store) => {
      const p1 = new Vector2(store.get('x'), store.get('y'));
      const p2 = randomPoint(store);
      store.do.makeBoltBetween(p1, p2);
      if (Math.random() < 0.25) {
        store.do.makeBoltBetween(p1, randomPoint(store));
        store.do.makeBoltBetween(p1, randomPoint(store));
      }
      setTimeout(store.do.makeBolt, _.random(0, MAX_BOLT_DELAY));
    })
    .addAction('makeBoltBetween', (store, p1, p2) => {
      const bolts = store.get('bolts');
      const points = boltPoints(p1, p2);
      const bolt = new PIXI.Graphics();
      const lg = store.get('lightGroup');
      bolt.lineStyle(1, chroma(240, 245, 255).num(), _.random(0.5, 1, true))
        .moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(({ x, y }) => {
        bolt.lineTo(x, y);
      });
      bolts.add(bolt);

      if (Math.random() < 0.4) {
        const jumpPoint = _(points).shuffle().first();
        const jumpPoint2 = randomPoint(store);
        const points2 = boltPoints(jumpPoint, jumpPoint2);
        bolt.lineStyle(1, chroma(240, 245, 255).num(), 1)
          .moveTo(points2[0].x, points2[0].y);
        points2.slice(1).forEach(({ x, y }) => {
          bolt.lineTo(x, y);
        });
      }

      lg.addChild(bolt);
      const lifespan = _.random(MIN_BOLT_LIFE, MAX_BOLT_LIFE);
      store.do.fadeBolt(bolt, lifespan / 4);
    })
    .addAction('fadeBolt', (store, bolt, time) => {
      setTimeout(() => {
        if (bolt.alpha < 0.05) {
          store.do.clearBolt(bolt);
          return;
        }
        // eslint-disable-next-line no-param-reassign
        bolt.alpha = _N(bolt.alpha, 0).times(BOLT_FADE).value;
        store.do.fadeBolt(bolt, time);
      }, time);
    })
    .addAction('clearBolt', (store, bolt) => {
      const bolts = store.get('bolts');
      bolts.delete(bolt);
      const lightGroup = store.get('lightGroup');
      lightGroup.removeChild(bolt);
    })
    .addAction('restartBolts', (store) => {
      store.do.resetBolts();
      store.do.makeBolt();
    });
}
