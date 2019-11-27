import chroma from 'chroma-js';
import * as PIXI from 'pixi.js';
import _N from '@wonderlandlabs/n';
import _ from 'lodash';

const DENSITY_COLOR = chroma(225, 245, 255).num();
/**
 * Sector represents about a region of space in a Hex.
 * It can contain none or many stars.
 */
class Sector {
  constructor(coord, matrix, store) {
    this.coord = coord;
    this.matrix = matrix;
    this.store = store;
    this._lineColor = chroma(204, 225, 255).num();
  }

  get id() {
    return this.coord.toString();
  }

  get corners() {
    if (!this._corners) {
      this._corners = this.matrix.corners(this.coord);
    }
    return this._corners;
  }

  get density() {
    const map = this.store.get('densityMap');
    if (map.has(this.id)) return map.get(this.id);
    return 0;
  }

  get first() {
    return this.corners[0];
  }

  get x() { return this.coord.x; }

  get y() { return this.coord.y; }

  get z() { return this.coord.z; }

  get xDec() { return _N(this.x).plus(20).div(40).value; }

  get yDec() { return _N(this.y).plus(20).div(40).value; }

  get zDec() { return _N(this.z).plus(20).div(40).value; }

  hexLine(g) {
    g.moveTo(this.first.x, this.first.y);
    this.corners.slice(1).forEach(({ x, y }) => g.lineTo(x, y));
    g.lineTo(this.first.x, this.first.y);
  }

  get galaxyGroup() {
    return this.store.get('galaxyGroup');
  }

  addGraphicToGG() {
    this.galaxyGroup.addChild(this.graphic);
  }

  get graphic() {
    if (!this._graphic) {
      this._graphic = new PIXI.Graphics();
    }
    return this._graphic;
  }

  drawOutline() {
    const hex = this.graphic;
    hex.lineStyle(4, this._lineColor, 0.8, 1, true);
    this.hexLine(hex);
  }

  drawDensity() {
    const center = this.coord.toXY(this.matrix);
    const radius = _N(this.density, 0)
      .times(this.matrix.scale)
      .div(3)
      .value;


    this.graphic.beginFill(DENSITY_COLOR)
      .drawCircle(center.x, center.y, radius)
      .endFill();
  }

  render() {
    try {
      this.addGraphicToGG();
      this.drawOutline();
      this.drawDensity();
    } catch (err) {
      console.log('error rendering:', err);
    }
  }
}

export default Sector;
