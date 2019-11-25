import chroma from 'chroma-js';
import _ from 'lodash';

const FADE_DURATION = 600;

const transparent = chroma(0, 0, 0).num();

export default class Hex {
  constructor(coord, matrix, g) {
    this.coord = coord;
    this.matrix = matrix;
    this._pColor = chroma(255, _.random(0, 255), 0).num();
    this.g = g;
  }

  get g() {
    return this._g;
  }

  set g(g) {
    this._g = g;
    g.on('mouseover', this.drawOver);
    g.on('mouseout', this.fade);
    g.interactive = true;
    g.interactiveChildren = true;
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

  get first() {
    return this.corners[0];
  }

  hexLine() {
    const g = this._g;
    g.moveTo(this.first.x, this.first.y);
    this.corners.slice(1).forEach(({ x, y }) => g.lineTo(x, y));
  }

  drawOver() {
    const g = this._g;
    g.alpha = 1;
    g.beginFill(this._pColor, 0.5);
    g.clear();
    this.hexLine();
    g.endFill();
    g.calculateBounds();
    this.over = true;
    this.fading = false;
  }

  fade() {
    if (this.over) {
      this.fading = Date.now();
      this.over = false;
      this.drawOut();
    }
  }

  drawOut() {
    if (this.over) {
      return;
    }
    if (!this.fading) {
      const g = this._g;
      g.clear();
      g.beginFill(transparent, 0.1);
      this.hexLine();
      g.endFill();

      g.lineStyle(1, this._pColor, 0.1, 0.5, false);
      this.hexLine();
      g.calculateBounds();
    } else {
      const elapsed = Date.now() - this.fading;

      if (elapsed > FADE_DURATION) {
        this.fading = false;
        this.drawOut();
        g.alpha = 1;
      } else {
        g.alpha = ((FADE_DURATION - elapsed) / FADE_DURATION) ** 2;
        requestAnimationFrame(() => this.drawOut());
      }
    }
  }
}
