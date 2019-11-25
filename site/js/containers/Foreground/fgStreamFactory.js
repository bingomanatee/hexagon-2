import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import _N from '@wonderlandlabs/n';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import configUniverse from './configUniverse';

let universe;
export const getUniverse = () => universe;

export default ({ size, history }) => {
  universe = new ValueStream('home-stream')
    .addAction('tryInit', (store, ele, size) => {
      if (ele) {
        store.do.setEle(ele);
        const app = new PIXI.Application({ transparent: true, forceFXAA: true });
        const { width, height } = size;
        store.set('width', width, 'height', height, 'app', app);

        // eslint-disable-next-line no-param-reassign
        ele.innerHTML = '';
        store.do.setApp(app);
        store.do.initUniverse();
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
        store.do.restartHex();
      }
    })
    .addSubStream('x', 0, 'number')
    .addSubStream('y', 0, 'number')
    .addSubStream('status', 'new', 'string')
    .addSubStream('ele', null)
    .addSubStream('width', _.get(size, 'width', 0), 'number')
    .addSubStream('height', _.get(size, 'height', 0), 'number')
    .addChild('history', history)
    .addSubStream('currentGalaxyName', '')
    .addSubStream('app', null)
    .addAction('updateMousePos', (store, x, y) => {
      if (_N(x).isValid) {
        store.do.setX(x);
        store.do.setY(y);
      }
    }, true);

  configUniverse(universe);

  universe.watch('currentGalaxyName', ({ name, value }) => {
    console.log('watch: current galaxy name set to ', value);
    if (!value) {
      universe.do.setCurrentGalaxy(null);
    } else universe.do.tryToLoadGalaxyFromName();
  });

  return universe;
};
