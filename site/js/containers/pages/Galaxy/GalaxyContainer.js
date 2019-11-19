import React, { Component } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { Heading, Text } from 'grommet';
import GalaxyView from './GalaxyView';
import { getUniverse } from '../../Foreground/fgStreamFactory';

export default class GalaxyContainer extends Component {
  constructor(props) {
    super(props);
    const galaxyName = _.get(props, 'match.params.id', '---');
    this.state = { uStream: null, id: galaxyName };
    console.log('galaxy name:', galaxyName);
  }

  componentDidMount() {
    this._tryToGetUniverse();
  }

  _tryToGetUniverse() {
    const u = getUniverse();
    if (u) {
      console.log('retrieved universe in Galaxy Container');
      this.setState({ uStream: u });
      u.do.setCurrentGalaxyName(this.state.id);
    }
    requestAnimationFrame(() => {
      this._tryToGetUniverse();
    });
  }

  render() {
    return (
      <GalaxyView galaxyName={this.state.id} />
    );
  }
}
