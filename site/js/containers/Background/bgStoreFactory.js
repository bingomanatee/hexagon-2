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
const CHUNK_COUNT = 500;

const g = () => {
  const graphics = new PIXI.Graphics();
  // graphics.cacheAsBitmap = true;
  graphics.alpha = 0;
  // graphics.filters = [noiseFilter];
  return graphics;
};

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

  return new Vector2(_.random(-width / 2, width * 1.5), _.random(-height / 2, height * 1.5));
};

export default (initialSize) => {
  const stream = new ValueStream('home-stream')
    .addSubStream('cloudGroup')
    .addSubStream('lightGroup')
    .addAction('tryInit', (store, ele, size) => {
      if (ele) {
        store.do.setEle(ele);
        const app = new PIXI.Application();
        app.stage.transform.pivot = { x: size.width / 2, y: size.height / 2 };
        app.stage.transform.rotation = Math.PI / 6;
        const cc = new PIXI.Container();
        const lc = new PIXI.Container();
        store.do.setCloudGroup(cc);
        store.do.setLightGroup(lc);
        app.stage.addChild(cc);
        app.stage.addChild(lc);
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
      if (app) {
        app.stage.transform.pivot = { x: width / 2, y: height / 2 };
        app.stage.transform.rotation = Math.PI / 6;
        app.renderer.resize(width, height);
        store.do.testPattern();
        store.do.initLightning();
      }
    })
    .addSubStream('lightning', new Set())
    .addAction('clearLightning', (store) => {
      const app = store.get('app');
      const lightning = store.get('lightning');
      try {
        lightning.forEach((l) => app.stage.removeChild(l));
      } catch (err) {

      }
      lightning.clear();
    })
    .addAction('makeLightning', (store) => {
      const p1 = randomPoint(store);
      const p2 = randomPoint(store);
      const mid = randomPoint(store);
      const graphics = new PIXI.Graphics();
      const lg = store.get('lightGroup');
      graphics.lineStyle(1,chroma(240,245,255).num(),1)
        .moveTo(p1.x, p1.y)
        .lineTo(mid.x, mid.y)
        .lineTo(p2.x, p2.y);
      lg.addChild(graphics);
    })
    .addAction('initLightning', (store) => {
      const app = store.get('app');
      store.do.clearLightning();
      store.do.makeLightning();
    })
    .addSubStream('starGroups', new Map())
    .addAction('initStars', (store, scaleName) => {
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

      const byY = _(points)
        .groupBy(({ y }) => Math.floor(y / 2))
        .values()
        .map(_.shuffle)
        .value();
      console.log('ionitStars: setting stars for ', scaleName, byY);
      store.get('starGroups').set(scaleName, byY);
      store.do.drawStars(scaleName);
    })
    .addSubStream('noises', new Map())
    .addSubStream('scales', new Map())
    .addAction('drawStars', (store, scaleName) => {
      if (!store.get('scales').has(scaleName)) {
        console.log('cannot drawStars', scaleName);
        return;
      }
      const scale = scaleToScreen(store.get('scales').get(scaleName),
        store.get('width'), store.get('height'));

      let starsToDraw;
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

        const groups = store.get('starGroups');
        if (!groups.has(scaleName)) {
          requestAnimationFrame(() => store.do.drawStars(scaleName));
          return;
        }
        const starPoints = groups.get(scaleName);
        if (!starPoints.length) {
          return;
        }
        starsToDraw = starPoints.splice(_.random(0, starPoints.length - 1), 1)[0];
      } catch (err) {
        console.log('error in drawStars for ', scale, err);
        return;
      }
      const graphics = g();
      starsToDraw.forEach((point) => {
        const { x, y } = point;
        if ('_meanY' in graphics) {
          graphics._meanY = (graphics._meanY + y) / 2;
        } else {
          graphics._meanY = y;
        }

        const xn = _N(x).div(scale).value;
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
        graphics.endFill();
      });
      store.do.addCloud(graphics);
      if (starsToDraw.length) {
        requestAnimationFrame(() => {
          store.do.drawStars(scaleName);
        });
      }
    })
    .addAction('testPattern', (store) => {
      store.do.setGraphics(new Set());
      const app = store.get('app');
      app.stage.removeChildren();

      store.do.initStars(SCALE_SM);
      store.do.initStars(SCALE_MED);
      store.do.initStars(SCALE_LG);
      if (!store.get('tweaked')) {
        store.do.tweakAlphas();
      }
    }, true)
    .addAction('updateFromX', (store, x) => {
      if (_N(x).isValid) {
        store.do.setX(x);
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
    .addSubStream('tweaked', false, 'boolean')
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
