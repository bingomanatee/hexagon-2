import React, { Component } from 'react';
import _ from 'lodash';
import GalaxyView from './GalaxyView';
import { getUniverse } from '../../Foreground/fgStreamFactory';

export default class GalaxyContainer extends Component {
  constructor(props) {
    super(props);
    const galaxyName = _.get(props, 'match.params.id', '---');
    this.state = {
      universe: null, id: galaxyName, galaxy: null, sectors: [],
    };
    console.log('galaxy name:', galaxyName);
    this.setSectors = this.setSectors.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this._tryToGetUniverse();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  _tryToGetUniverse() {
    const universe = getUniverse();
    if (universe) {
      if (this.mounted) {
        const galaxy = universe.get('currentGalaxy');
        const sectors = _.get(galaxy, 'sectors', []);
        this.setState({ universe, galaxy, sectors });
      }

      universe.watch('currentGalaxy', ({ value }) => {
        console.log('watching galaxy -- got ', value);
        if (value !== this.state.galaxy) {
          const sectors = _.get(value, 'sectors', []);
          this.setState({ galaxy: value, sectors });
        }
      });

      const { id } = this.state;
      if (id) {
        universe.do.setCurrentGalaxyName(id);
      }
    } else {
      requestAnimationFrame(() => {
        this._tryToGetUniverse();
      });
    }
  }

  setSectors(sectors) {
    if (Array.isArray(sectors)) {
      this.setState({ sectors });
    }
  }

  render() {
    const { id, galaxy, sectors } = this.state;
    return (
      <GalaxyView
        setSectors={this.setSectors}
        sectors={sectors}
        galaxyName={id}
        galaxy={galaxy}
      />
    );
  }
}
