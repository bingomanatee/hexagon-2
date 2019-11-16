import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const Frame = styled.div`
margin: 0;
overflow: hidden;
width: 100%;
`;

export default class HomeView extends PureComponent {
  render() {
    return (
      <Box fill direction="row" alignContent="stretch" align="stretch" as="section">
        <Frame>
          {this.props.children}
        </Frame>
      </Box>
    );
  }
}
