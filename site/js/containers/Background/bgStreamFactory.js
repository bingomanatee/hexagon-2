import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import * as PIXI from 'pixi.js';
import _ from 'lodash';

import configBolts from './configBolts';
import configClouds from './configClouds';

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
        ele.appendChild(app.view);
        store.do.resizeApp(size);
        store.do.setStatus('started');
      }
    }, true)
    .addAction('resizeApp', (store, { width, height }) => {
      const app = store.get('app');
      store.set('width', width, 'height', height);
      if (app) {
        app.renderer.resize(width, height);
        store.do.restartClouds();
        store.do.restartBolts();
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

  return stream;
};
