import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {Box, Heading, Text} from 'grommet';

const Frame = styled.div`
margin: 0;
overflow: hidden;
width: 100%;
`;

export default class HomeView extends PureComponent {
  render() {
    return (
      <Box className="site-frame" fill direction="row" alignContent="stretch" align="stretch" as="section">
        <Frame className="site-frame">
          <Box justifyContent="center" direction="column">
            <Heading level={1} textAlign="center" color="dark-3">Welcome to the Hexiverse</Heading>
            <Text textAlign="center">Click on an area to view or create a universe</Text>
          </Box>
        </Frame>
      </Box>
    );
  }
}
