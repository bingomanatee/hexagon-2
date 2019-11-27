import React, { Component } from 'react';
import styled from 'styled-components';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import {
  Stack, Box, Text, Button,
} from 'grommet';
import _ from 'lodash';
import galStreamFactory from './galStreamFactory';
import GalaxyEditView from './GalaxyEditView';

const TextFrame = styled.article`
width: 25%;
padding: 2rem;
height:25%;
background-color: black;
border: 6px solid rgba(200,200,200,0.25);
margin: 4px;
border-radius: 1rem 1rem 4rem 1rem;
`;

class GalaxyTicket extends Component {
  render() {
    console.log('ticket props:', this.props);
    const { galaxy, hasGalaxy } = this.props;
    if (!galaxy) return <span>&nbsp;</span>;

    let label = 'This sector of the universe';
    if (galaxy) label = `Sector ${galaxy.id}`;
    return (
      <Box directon="column" fill="vertical" align="stretch" alignContent="stretch">
        <TextFrame>
          <Box direction="column" fill="vertical" alignContent="between">
            <Box flex="grow">
              <Text>
                {hasGalaxy
                  ? `${label} has a galaxy`
                  : `${label} is empty`}
              </Text>
            </Box>
          </Box>
        </TextFrame>
      </Box>
    );
  }
}

export default class GalaxyEditContainer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.stream = galStreamFactory(props);
    this.resizeApp = _.debounce(() => this.stream.do.resizeApp(this.props.size), 200);
    this.state = { galaxy: false, hasGalaxy: false };
  }

  componentDidMount() {
    const { size } = this.props;
    const ele = _.get(this, 'ref.current');
    if (ele) {
      this.stream.do.tryInit(ele, size);
    } else {
      console.log('no element to size to');
    }


    this.stream.filter(['galaxy', 'hasGalaxy']).subscribe((data) => {
      console.log('data updated: ', data);
      this.setState(data);
    },
    (err) => {
      console.log('galaxy stream error: ', err);
    });

    const gal = _.get(this, 'props.galaxy');
    if (gal) {
      this.stream.do.setGalaxy(gal);
    }
  }

  componentDidUpdate(prevProps) {
    const prevWidth = _.get(prevProps, 'size.width');
    const prevHeight = _.get(prevProps, 'size.height');
    const prevGal = _.get(prevProps, 'galaxy');
    const gal = _.get(this, 'props.galaxy');
    if (prevGal !== gal) {
      this.stream.do.setGalaxy(gal);
    }
    if (prevWidth !== _.get(this, 'props.size.width') || prevHeight !== _.get(this, 'props.size.height')) {
      this.resizeApp();
    }
  }

  render() {
    const { hasGalaxy, galaxy } = this.state;
    console.log('rendering with galaxy:', galaxy);
    return (
      <Stack interactiveChild="last" guidingChild="last">
        <GalaxyTicket galaxy={galaxy} hasGalaxy={hasGalaxy} />
        <GalaxyEditView reference={this.ref} />
      </Stack>
    );
  }
}
