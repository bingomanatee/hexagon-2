import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const Frame = styled.div`
margin: 0;
overflow: hidden;
width: 100%;
height: 100%;
position: absolute;
top: 0;
left: 0;
z-index: 10000;
`;

const HIDE = { display: 'none' };
const SHOW = {};

export default class FGView extends PureComponent {
  render() {
    return (
      <Frame ref={this.props.reference} style={this.props.galaxy ? HIDE : SHOW} />
    );
  }
}
