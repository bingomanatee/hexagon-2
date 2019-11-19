import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import * as PIXI from 'pixi.js';
import _ from 'lodash';

export default (initialSize) => new ValueStream('home-stream')
  .addSubStream('width', _.get(initialSize, 'width', 0), 'number')
  .addSubStream('height', _.get(initialSize, 'height', 0), 'number');
