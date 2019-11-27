import chroma from 'chroma-js';
import _ from 'lodash';
import Noise from 'simplex-noise';

const FADE_DURATION = 600;

const transparent = chroma(0, 0, 0).num();

/**
 * Hex is a galaxy sized chunk of space. It is the top-level entity in
 * Hexagon.
 */
export default class Hex {
  constructor(coord, matrix, g) {
    this.coord = coord;
    this.matrix = matrix;
    this._pColor = chroma(255, _.random(0, 255), 0).num();
    this.g = g;

    this._sectors = [];
  }

  linkToSectorStream(ss) {
    this.sectorStream = ss;
    ss.do.setGalaxy(this);
  }

  get sectors() {
    return this._sectors;
  }

  set sectors(value) {
    this._sectors = value;
  }

  get g() {
    return this._g;
  }

  set g(g) {
    this._g = g;
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
    const g = this.g;
    g.moveTo(this.first.x, this.first.y);
    this.corners.slice(1).forEach(({ x, y }) => g.lineTo(x, y));
  }

  drawOver() {
    const g = this.g;
    try {
      g.alpha = 1;
      g.clear();
      g.beginFill(this._pColor, 0.5);
      this.hexLine();
      g.endFill();
      this.over = true;
      this.fading = false;
    } catch (err) {
      console.log('drawOver error:', err, this);
    }
    g.calculateBounds();
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
    const g = this.g;
    try {
      if (!this.fading) {
        g.clear();
        g.beginFill(transparent, 0.1);
        this.hexLine();
        g.endFill();

        g.lineStyle(1, this._pColor, 0.1, 0.5, false);
        this.hexLine();
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
    } catch (err) {
      console.log('drawOut error:', err, this);
    }
    g.calculateBounds();
  }
}
