import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import chroma from 'chroma-js';
import SimplexNoise from 'simplex-noise';
import _N from '@wonderlandlabs/n';

const noise = new SimplexNoise('to boldly go');
const noise2 = new SimplexNoise('where nobody');
const noise3 = new SimplexNoise('has gone before');
const noise4 = new SimplexNoise('these are the voyages');
const noise5 = new SimplexNoise('of the starship');
const noise6 = new SimplexNoise('enterprise');
const noise7 = new SimplexNoise('its five');
const noise8 = new SimplexNoise('year');
const noise9 = new SimplexNoise('mission');
const SCALE = 5;
const SCALE2 = 10;
const SCALE3 = 20;
const MAX_CYCLES = 100;
const OP = 1;

const noiseFilter = new PIXI.filters.NoiseFilter(1);
const blur = new PIXI.filters.BlurFilterPass(true, 2, 2);
const g = () => {
  const graphics = new PIXI.Graphics();
  graphics.cacheAsBitmap = true;
  // graphics.filters = [noiseFilter];
  return graphics;
};

const tile = (app, scale, width, height, n, n2, n3, op) => {
  let graphics = g();
  let count = 0;
  let input = [];
  let value;
  let value2;
  let value3;

  const expressInput = () => {
    while (count < MAX_CYCLES && input.length) {
      const { x, y } = input.pop();
      const xn = _N(x).div(scale).value;
      const yn = _N(y).div(scale).value;
      value = _N(n.noise2D(xn / 5, yn / 5)).times(255).value;
      value2 = _N(n2.noise2D(xn / 5, yn / 5)).times(255).value;
      value3 = _N(n3.noise2D(xn / 5, yn / 5)).times(255).value;

      const red = _N(_.mean([value, value2, value3]) + value).clamp(0, 200).floor().value;
      const green = _N(_.min([value, value2, value3]) + 2 * value2).clamp(0, 120).floor().value;
      const blue = _N(_.max([value, value2, value3]) + value3).clamp(0, 255).floor().value;
      const divisor = _N(value - value3).abs().plus(5);
      const opacity = _N(OP).div(divisor).clamp(0.001, 0.025);
      graphics.beginFill(chroma(red, green, blue).num(), opacity.value);
      if (value2 > value) {
        graphics.drawCircle(x, y, scale * 2);
      } else {
        graphics.drawRect(x - SCALE, y - SCALE, scale * 3, scale * 3);
      }
      graphics.endFill();
      count += 1;
    }
    app.stage.addChild(graphics);
    graphics = g();
    count = 0;
    if (input.length) {
      if (value2 > value) requestAnimationFrame(expressInput);
      else expressInput();
    }
  };

  _.range((scale * -3), width + (3 * scale), scale)
    .forEach((x) => {
      _.range((scale * -3), height + (3 * scale), scale)
        .forEach((y) => {
          input.push({ x, y });
        });
    });
  input = _.shuffle(input);
  expressInput();
};

export default (initialSize) => new ValueStream('home-stream')
  .addAction('tryInit', (store, ele, size) => {
    if (ele) {
      store.do.setEle(ele);
      const app = new PIXI.Application();
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
      app.renderer.resize(width, height);
      store.do.testPattern();
    }
  })
  .addAction('testPattern', (store) => {
    const app = store.get('app');
    while (app.stage.children.length) app.stage.removeChildAt(0);
    const width = store.get('width');
    const height = store.get('height');
    tile(app, SCALE, width, height, noise, noise2, noise3, OP * 2);
    tile(app, SCALE2, width, height, noise4, noise5, noise6, OP);
    tile(app, SCALE3, width, height, noise7, noise8, noise9, OP / 2);
  })
  .addSubStream('status', 'new', 'string')
  .addSubStream('ele', null)
  .addSubStream('width', _.get(initialSize, 'width', 0), 'number')
  .addSubStream('height', _.get(initialSize, 'height', 0), 'number')
  .addSubStream('app', null);
