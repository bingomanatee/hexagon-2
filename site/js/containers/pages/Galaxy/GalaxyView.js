import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Box, Heading, Text } from 'grommet';

export default class GalaxyView extends PureComponent {
  render() {
    const { galaxyName } = this.props;
    return (
      <Box
        className="site-frame"
        direction="row"
        fill="horizontal"
        alignContent="stretch"
        align="stretch"
        as="section"
      >
        <Box justifyContent="center" direction="column"
             fill="horizontal">
          <Heading level={1} textAlign="center" color="dark-3">
            Galaxy
            {' '}
            {galaxyName}
          </Heading>
          <Text textAlign="center">Click on an area to view a sector</Text>
        </Box>
      </Box>
    );
  }
}
