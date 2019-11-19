import _ from 'lodash';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _N from '@wonderlandlabs/n';
import SimplexNoise from 'simplex-noise';
import { Vector2 } from 'three';

const MOUSE_LERP = 0.89;
const SHEET_PATH = '/orion-sprite-sheet/orion-sprites.json';
export const SCALE_SM = 'small';
export const SCALE_MED = 'med';
export const SCALE_LG = 'large';

const noise = new SimplexNoise('to boldly go');
const noise2 = new SimplexNoise('where nobody');
const noise3 = new SimplexNoise('has gone before');
const noise4 = new SimplexNoise('these are the voyages');
const noise5 = new SimplexNoise('of the starship');
const noise6 = new SimplexNoise('enterprise');
const noise7 = new SimplexNoise('its five');
const noise8 = new SimplexNoise('year');
const noise9 = new SimplexNoise('mission');

const SCALE = 12;
const SCALE2 = 24;
const SCALE3 = 36;

const INERTIA = 0.85;
const ALPHA_SCALE = 1;

let doneLoadingSprites;
const loaderPromise = new Promise((done) => {
  doneLoadingSprites = done;
});

PIXI.Loader.shared.add(SHEET_PATH).load(() => {
  doneLoadingSprites();
});

const lerp = (a, b, l) => a * l + b * (1 - l);

const c = (alpha = 0.5) => {
  const coll = new PIXI.Container();
  coll.alpha = alpha;
  return coll;
};


const scaleToScreen = (baseScale, width, height) => {
  const extent = Math.sqrt(width * height);
  if (extent) {
    return baseScale * (extent / 500);
  }
  return baseScale;
};

export default (stream) => {
  stream
    .addSubStream('tweaked', false, 'boolean')
    .addSubStream('graphics', new Set())
    .addSubStream('cloudPointGroups', new Map())
    .addSubStream('noises', new Map())
    .addSubStream('scales', new Map())
    .addChild('cloudGroup')
    .addAction('initClouds', (store) => {
      const cc = new PIXI.Container();
      const app = store.get('app');
      const width = store.get('width');
      const height = store.get('height');
      cc.transform.pivot = { x: width / 2, y: height / 2 };
      // cc.transform.rotation = Math.PI / 6;
      app.stage.addChild(cc);
      store.do.setCloudGroup(cc);
    })
    .addAction('tweakAlphas', (store) => {
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

      setTimeout(store.do.tweakAlphas, 200);
    })
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
              points.push({ x, y: _N(y).add(_N(scale).times(Math.random()).div(2)).value });
            });
        });

      const cloudsGroupedByY = _(points)
        .groupBy(({ y }) => Math.floor(y / 2))
        .values()
        .map(_.shuffle)
        .value();
      store.get('cloudPointGroups').set(scaleName, cloudsGroupedByY);
      await loaderPromise;
      store.do.drawClouds(scaleName, scale);
    })
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
        sprite.scale = { x: scale / 72, y: scale / 72 };
        sprite.pivot = { x: scale / 2, y: scale / 2 };
        sprite.rotation = _.random(0, Math.PI * 2, true);
        sprite.position = { x, y };
        row.addChild(sprite);

        const xn = _N(x).div(scale).value;
        const yn = _N(y).div(scale).value;
        const value = _N(n.noise2D(xn / 5, yn / 5)).times(255).value;
        const value2 = _N(n2.noise2D(xn / 5, yn / 5)).times(255).value;
        const value3 = _N(n3.noise2D(xn / 5, yn / 5)).times(255).value;

        const red = _N(_.mean([value, value2, value3]) + value).clamp(0, 200).floor().value;
        const green = _N(_.min([value, value2, value3]) + 2 * value2).clamp(0, 120).floor().value;
        const blue = _N(_.max([value, value2, value3]) + value3).clamp(0, 255).floor().value;

        sprite.tint = chroma(red, green, blue).num();
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
    .addAction('restartClouds', (store) => {
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
        const lerpPoint = store.get('lerpPoint');
        store.do.setLerpPoint(lerpPoint.lerp({ x, y }, MOUSE_LERP));
        store.do.setX(x);
        store.do.setY(y);
        const width = store.get('width');
        const height = store.get('height');
        store.get('graphics').forEach((g) => {
          if (g._width !== width || g._height !== height) {
            g._effect = _N(g._meanY)
              .minus(height / 2)
              .div(height).plus(
                _N(Math.random()).div(10),
              )
              .abs().value;
            g._width = width;
            g._height = height;
          }

          const xOffset = _N(width)
            .div(-2)
            .plus(x) // the offset of x from width/2
            .times(g._effect);

          const newX = _N(0)
            .plus(
              xOffset, // scaled by the points' height from the top
            )
            .floor();

          // eslint-disable-next-line no-param-reassign
          g.position = { x: newX.value, y: g.position.y };
        }, true);
      }
    }, true)
    .addChild('lerpPoint', new Vector2(200, 200))
    .addAction('addCloud', (store, graphics) => {
      if (graphics) {
        store.get('graphics').add(graphics);
        store.get('cloudGroup').addChild(graphics);
      }
    });

  stream.get('noises').set(SCALE_SM, [noise, noise2, noise3]);
  stream.get('noises').set(SCALE_MED, [noise4, noise5, noise6]);
  stream.get('noises').set(SCALE_LG, [noise7, noise8, noise9]);

  stream.get('scales').set(SCALE_SM, SCALE);
  stream.get('scales').set(SCALE_MED, SCALE2);
  stream.get('scales').set(SCALE_LG, SCALE3);
};
