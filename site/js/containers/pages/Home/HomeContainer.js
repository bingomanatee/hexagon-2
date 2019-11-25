import React, { Component } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { Heading, Text } from 'grommet';
import HomeView from './HomeView';

import { getUniverse } from '../../Foreground/fgStreamFactory';

export default class HomeContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.mounted = true;
    this._tryToGetUniverse();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  _tryToGetUniverse() {
    const u = getUniverse();
    if (u) {
      u.do.setCurrentGalaxyName('');
    }
  }

  render() {
    return (
      <HomeView reference={this.ref}>
        <Heading dark level={1}>Welcome To HexWorld</Heading>
      </HomeView>
    );
  }
}
