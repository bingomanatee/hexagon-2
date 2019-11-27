import chroma from 'chroma-js';
import * as PIXI from 'pixi.js';
import _N from '@wonderlandlabs/n';
import _ from 'lodash';
import {
  DEN_COLOR_2, DEN_COLOR_3, DEN_COLOR_1, DEN_COLOR_4,
  DEN_2_BRACKET, DEN_3_BRACKET, DEN_4_BRACKET,
  SECTOR_LINE_COLOR
} from '../../graphColors';
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

  get xDec() { return _N(this.x).plus(20).div(5).value; }

  get yDec() { return _N(this.y).plus(20).div(5).value; }

  get zDec() { return _N(this.z).plus(20).div(5).value; }

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
    hex.lineStyle(4, SECTOR_LINE_COLOR.num(), 0.8, 1, true);
    this.hexLine(hex);
  }

  drawDensity() {
    const center = this.coord.toXY(this.matrix);
    const radius = this.density ? _N(this.density, 0)
      .max(0.2)
      .times(this.matrix.scale)
      .div(3)
      .value : 0;

    let color = DEN_COLOR_1;
    if (this.density > DEN_2_BRACKET) {
      color = DEN_COLOR_2;
    }
    if (this.density > DEN_3_BRACKET) {
      color = DEN_COLOR_3;
    }
    if (this.density > DEN_4_BRACKET) {
      color = DEN_COLOR_4;
    }

    this.graphic.beginFill(color.num())
      .drawCircle(center.x, center.y, radius)
      .endFill();
  }

  render() {
    try {
      this.addGraphicToGG();
      if (!this.density) this.drawOutline();
      this.drawDensity();
    } catch (err) {
      console.log('error rendering:', err);
    }
  }
}

export default Sector;
