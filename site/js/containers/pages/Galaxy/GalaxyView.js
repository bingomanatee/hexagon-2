import React, { PureComponent } from 'react';
import { withSize } from 'react-sizeme';
import styled from 'styled-components';
import {
  Box, Heading, Text, Grid,
} from 'grommet';
import GalaxyEditor from '../../GalaxyEdit';

export default class GalaxyView extends PureComponent {
  render() {
    const {
      galaxyName, galaxy, sectors, setSectors,
    } = this.props;

    return (
      <Grid
        rows={['10rem', '1fr']}
        columns={['small', 'auto']}
        gap="small"
        fill="vertical"
        areas={[
          { name: 'header', start: [0, 0], end: [1, 0] },
          { name: 'main', start: [0, 1], end: [1, 1] },
        ]}
      >
        <Box gridArea="header">
          <Heading level={1} textAlign="center" color="dark-3">
            {`Galaxy ${galaxyName}`}
          </Heading>
          <Text textAlign="center">Click on an area to view a sector</Text>
        </Box>
        <Box gridArea="main">
          <GalaxyEditor galaxy={galaxy} sectors={sectors} setSectors={setSectors} />
        </Box>
      </Grid>
    );
  }
}
