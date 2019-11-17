import React, { Component } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { Heading, Text } from 'grommet';
import HomeView from './HomeView';

export default class HomeContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <HomeView reference={this.ref}>
        <Heading dark level={1}>Welcome To HexWorld</Heading>
      </HomeView>
    );
  }
}
