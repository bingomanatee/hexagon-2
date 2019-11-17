import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import chroma from 'chroma-js';
import SimplexNoise from 'simplex-noise';
import _N from '@wonderlandlabs/n';
import { Hexagons } from '@wonderlandlabs/hexagone';
import { Vector2 } from 'three';
import configBolts from './configBolts';
import configClouds from './configClouds';
import configUniverse from './configUniverse';

export default (initialSize) => {
  const stream = new ValueStream('home-stream')
    .addAction('tryInit', (store, ele, size) => {
      if (ele) {
        store.do.setEle(ele);
        const app = new PIXI.Application();
        const { width, height } = size;
        store.set('width', width, 'height', height, 'app', app);

        // eslint-disable-next-line no-param-reassign
        ele.innerHTML = '';
        store.do.setApp(app);
        store.do.initClouds();
        store.do.initBolts();
        store.do.initUniverse();
        ele.appendChild(app.view);
        store.do.resizeApp(size);
        store.do.setStatus('started');
      }
    }, true)
    .addAction('resizeApp', (store, { width, height }) => {
      const app = store.get('app');
      store.set('width', width, 'height', height);
      console.log('setting width and height to ', width, height, 'for window', window.innerWidth, window.innerHeight);
      if (app) {
        app.renderer.resize(width, height);
        store.do.restartClouds();
        store.do.restartBolts();
        store.do.restartHex();
      }
    })
    .addSubStream('x', 0, 'number')
    .addSubStream('y', 0, 'number')
    .addSubStream('status', 'new', 'string')
    .addSubStream('ele', null)
    .addSubStream('width', _.get(initialSize, 'width', 0), 'number')
    .addSubStream('height', _.get(initialSize, 'height', 0), 'number')
    .addSubStream('app', null);

  configBolts(stream);
  configClouds(stream);
  configUniverse(stream);

  return stream;
};
