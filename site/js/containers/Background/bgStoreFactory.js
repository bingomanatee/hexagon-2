import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import chroma from 'chroma-js';
import SimplexNoise from 'simplex-noise';
import _N from '@wonderlandlabs/n';
import { Vector2 } from 'three';

const noise = new SimplexNoise('to boldly go');
const noise2 = new SimplexNoise('where nobody');
const noise3 = new SimplexNoise('has gone before');
const noise4 = new SimplexNoise('these are the voyages');
const noise5 = new SimplexNoise('of the starship');
const noise6 = new SimplexNoise('enterprise');
const noise7 = new SimplexNoise('its five');
const noise8 = new SimplexNoise('year');
const noise9 = new SimplexNoise('mission');

const SCALE_SM = 'small';
const SCALE_MED = 'med';
const SCALE_LG = 'large';

const SCALE = 8;
const SCALE2 = 16;
const SCALE3 = 32;
const INERTIA = 0.95;
const ALPHA_SCALE = 20;

const MAX_BOLT_DELAY = 2000;
const MIN_BOLT_LIFE = 100;
const MAX_BOLT_LIFE = 1000;
const BOLT_FADE = 2 / 3;
const LIGHT_MIN_DIST = 20;

const SHEET_PATH = '/orion-sprite-sheet/orion-sprites.json';

const g = () => {
  const graphics = new PIXI.Graphics();
  // graphics.cacheAsBitmap = true;
  graphics.alpha = 0.05;
  // graphics.filters = [noiseFilter];
  return graphics;
};

const c = (alpha = 0.5) => {
  const coll = new PIXI.Container();
  coll.alpha = alpha;
  return coll;
};

let doneLoadingSprites;
let failLoadingSprites;
const loaderPromise = new Promise((done, fail) => {
  doneLoadingSprites = done;
  failLoadingSprites = fail;
  console.log('defined doneLoadingSprites');
});

PIXI.Loader.shared.add(SHEET_PATH).load(() => {
  console.log('loaded orion sprite');
  doneLoadingSprites();
});

const scaleToScreen = (baseScale, width, height) => {
  const extent = Math.sqrt(width * height);
  if (extent) {
    return baseScale * extent / 500;
  }
  return baseScale;
};

const randomPoint = (store) => {
  const width = store.get('width');
  const height = store.get('height');

  console.log('random point between', width, height);
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

export default (initialSize) => {
  const stream = new ValueStream('home-stream')
    .addChild('cloudGroup')
    .addChild('lightGroup')
    .addAction('tryInit', (store, ele, size) => {
      if (ele) {
        store.do.setEle(ele);
        const app = new PIXI.Application();
        const cc = new PIXI.Container();
        const lc = new PIXI.Container();
        cc.transform.pivot = { x: size.width / 2, y: size.height / 2 };
        cc.transform.rotation = Math.PI / 6;
        store.do.setCloudGroup(cc);
        store.do.setLightGroup(lc);
        app.stage.addChild(cc);
        app.stage.addChild(lc);
        app.start();
        // eslint-disable-next-line no-param-reassign
        ele.innerHTML = '';
        store.do.setApp(app);
        ele.appendChild(app.view);
        store.do.resizeApp(size);
        store.do.setStatus('started');
      }
    })
    .addAction('resizeApp', (store, { width, height }) => {
      const app = store.get('app');
      store.set('width', width, 'height', height);
      console.log('setting width and height to ', width, height, 'for window', window.innerWidth, window.innerHeight);
      if (app) {
        app.renderer.resize(width, height);
        store.do.startClouds();
        store.do.initBolt();
      }
    })
    .addChild('bolts', new Set())
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
    .addAction('initBolt', (store) => {
      store.do.resetBolts();
      store.do.makeBolt();
    })
    .addSubStream('cloudPointGroups', new Map())
    .addAction('startCloudsForScale', async (store, scaleName) => {
      if (!store.get('scales').has(scaleName)) {
        return;
      }
      const scale = scaleToScreen(store.get('scales').get(scaleName), store.get('width'), store.get('height'));

      const width = store.get('width');
      const height = store.get('height');
      const extent = Math.max(width, height);
      const points = [];
      _.range(-extent, extent * 2, scale)
        .forEach((x) => {
          _.range(-extent, extent * 2, scale)
            .forEach((y) => {
              points.push({ x, y: (y + (scale * Math.random() / 2)) });
            });
        });

      const cloudsGroupedByY = _(points)
        .groupBy(({ y }) => Math.floor(y / 2))
        .values()
        .map(_.shuffle)
        .value();
      store.get('cloudPointGroups').set(scaleName, cloudsGroupedByY);
      console.log('awaiting loader promise');
      await loaderPromise;
      console.log('done awaiting loader promise');
      store.do.drawClouds(scaleName, scale);
    })
    .addSubStream('noises', new Map())
    .addSubStream('scales', new Map())
    .addAction('drawClouds', (store, scaleName, scale) => {
      let clouds;
      let n;
      let n2;
      let n3;
      try {
        const noises = store.get('noises');
        if (!noises.has(scaleName)) {
          return;
        }
        const noiseList = noises.get(scaleName);
        n = noiseList[0];
        n2 = noiseList[1];
        n3 = noiseList[2];

        const groups = store.get('cloudPointGroups');
        if (!groups.has(scaleName)) {
          requestAnimationFrame(() => store.do.drawClouds(scaleName, scale));
          return;
        }
        const cloudPoints = groups.get(scaleName);
        if (!cloudPoints.length) {
          return;
        }
        clouds = cloudPoints.splice(_.random(0, cloudPoints.length - 1), 1)[0];
      } catch (err) {
        console.log('error in drawClouds for ', scale, err);
        return;
      }
      const row = c(0.5);
      const sheet = PIXI.Loader.shared.resources[SHEET_PATH].spritesheet;
      store.do.addCloud(row);

      clouds.forEach((point) => {
        const { x, y } = point;
        if ('_meanY' in row) {
          row._meanY = (row._meanY + y) / 2;
        } else {
          row._meanY = y;
        }

        const spriteName = _(Array.from(Object.keys(sheet.textures))).shuffle().first();
        const sprite = new PIXI.Sprite(sheet.textures[spriteName]);
        sprite.pivot = { x: x + scale / 2, y: y + scale / 2 };
        sprite.scale = scale / 72;
       // sprite.rotation = _.random(0, Math.PI * 2, true);
        sprite.position = { x, y };
        row.addChild(sprite);

        /*        const xn = _N(x).div(scale).value;
        const yn = _N(y).div(scale).value;
        const value = _N(n.noise2D(xn / 5, yn / 5)).times(255).value;
        const value2 = _N(n2.noise2D(xn / 5, yn / 5)).times(255).value;
        const value3 = _N(n3.noise2D(xn / 5, yn / 5)).times(255).value;

        const red = _N(_.mean([value, value2, value3]) + value).clamp(0, 200).floor().value;
        const green = _N(_.min([value, value2, value3]) + 2 * value2).clamp(0, 120).floor().value;
        const blue = _N(_.max([value, value2, value3]) + value3).clamp(0, 255).floor().value;

        graphics.beginFill(chroma(red, green, blue).num());
        if (value2 > value) {
          graphics.drawCircle(x, y, scale * 2);
        } else {
          graphics.drawRect(x - SCALE, y - SCALE, scale * 3, scale * 3);
        }
        graphics.endFill(); */
      });
      if (clouds.length) {
        requestAnimationFrame(() => {
          store.do.drawClouds(scaleName, scale);
        });
      }
    })
    .addAction('initGraphics', (store) => {
      store.get('graphics').clear();
      store.get('cloudGroup').removeChildren();
    })
    .addAction('startClouds', (store) => {
      store.do.initGraphics();
      store.do.startCloudsForScale(SCALE_SM);
      store.do.startCloudsForScale(SCALE_MED);
      store.do.startCloudsForScale(SCALE_LG);
      if (!store.get('tweaked')) {
        store.do.tweakAlphas();
      }
    }, true)
    .addAction('updateMousePos', (store, x, y) => {
      if (_N(x).isValid) {
        store.do.setX(x);
        store.do.setY(y);
        const width = store.get('width');
        const height = store.get('height');
        store.get('graphics').forEach((g) => {
          if (!g._originalX) {
            g._originalX = g.position.x;
          }
          g._effect = _N(g._meanY)
            .minus(height / 2)
            .div(height).plus(
              _N(Math.random()).div(10),
            )
            .abs().value;

          const xOffset = _N(width)
            .div(-2)
            .plus(x) // the offset of x from width/2
            .times(g._effect);

          const newX = _N(0)
            .plus(
              xOffset, // scaled by the points' height from the top
            );

          // eslint-disable-next-line no-param-reassign
          g.position = { x: newX.value, y: g.position.y };
        });
      }
    })
    .addSubStream('x', 0, 'number')
    .addSubStream('y', 0, 'number')
    .addSubStream('tweaked', false, 'boolean')
    .addAction('tweakAlphas', (store) => {
      return;
      store.do.setTweaked(true);
      const graphics = store.get('graphics');

      graphics.forEach((g) => {
        // eslint-disable-next-line no-param-reassign
        const newAlpha = _N(Math.random).div(ALPHA_SCALE).minus(0.5 / ALPHA_SCALE);
        g.alpha = _N(g.alpha)
          .times(INERTIA)
          .plus(
            newAlpha.times(1 - INERTIA),
          )
          .clamp(0.1 / ALPHA_SCALE, 1 / ALPHA_SCALE)
          .value;
      });

      requestAnimationFrame(store.do.tweakAlphas);
    })
    .addSubStream('graphics', new Set())
    .addAction('addCloud', (store, graphics) => {
      if (graphics) {
        store.get('graphics').add(graphics);
        store.get('cloudGroup').addChild(graphics);
      }
    })
    .addSubStream('status', 'new', 'string')
    .addSubStream('ele', null)
    .addSubStream('width', _.get(initialSize, 'width', 0), 'number')
    .addSubStream('height', _.get(initialSize, 'height', 0), 'number')
    .addSubStream('app', null);

  stream.get('noises').set(SCALE_SM, [noise, noise2, noise3]);
  stream.get('noises').set(SCALE_MED, [noise4, noise5, noise6]);
  stream.get('noises').set(SCALE_LG, [noise7, noise8, noise9]);

  stream.get('scales').set(SCALE_SM, SCALE);
  stream.get('scales').set(SCALE_MED, SCALE2);
  stream.get('scales').set(SCALE_LG, SCALE3);


  return stream;
};
