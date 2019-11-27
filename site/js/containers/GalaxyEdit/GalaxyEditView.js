import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const Frame = styled.div`
margin: 0;
overflow: hidden;
width: 100%;
height: 100%;
top: 0;
left: 0;
`;

export default class GalaxyEditView extends PureComponent {
  render() {
    return (
      <Frame ref={this.props.reference} />
    );
  }
}
