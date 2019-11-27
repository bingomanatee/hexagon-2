import React, { Component } from 'react';
import { Box, Text } from 'grommet';
import styled from 'styled-components';
import {
  DEN_4_BRACKET, DEN_3_BRACKET, DEN_2_BRACKET,
  DEN_COLOR_1, DEN_COLOR_4, DEN_COLOR_3, DEN_COLOR_2,
  MAX_STARS_PER_SECTOR,
} from '../../../graphColors';

const brackets = [0, DEN_2_BRACKET, DEN_3_BRACKET, DEN_4_BRACKET, 1];

function ticketLabel(n) {
  const minNum = brackets[n - 1] * MAX_STARS_PER_SECTOR * 1000;
  const maxNum = brackets[n] * MAX_STARS_PER_SECTOR * 1000;

  return `${minNum.toFixed(1)}-${maxNum.toFixed(1)}`;
}

const TextFrame = styled.article`
padding: 1rem;
background-color: black;
border: 2px solid rgba(200,200,200,0.25);
margin: 2px;
border-radius: 0.5rem 0.4rem 4rem 0.5rem;
`;

const labels = [];

labels.push(ticketLabel(1));
labels.push(ticketLabel(2));
labels.push(ticketLabel(3));
labels.push(ticketLabel(4));

export default class GalaxyTicket extends Component {
  render() {
    return (
      <Box directon="column" fill="vertical" align="stretch" alignContent="stretch">
        <TextFrame>
          <Box direction="column" fill="vertical" alignContent="between">
            <Box flex="grow">
              <Text size="0.8rem">Hexes are 2,000 light hears across</Text>
              <Text size="0.8rem">Millions of stars/hex</Text>
              <Box margin="2px" align="center" background={DEN_COLOR_1.css()}>
                <Text color="black" size="0.8rem">
                  {labels[0]}
                </Text>
              </Box>
              <Box margin="2px" align="center" background={DEN_COLOR_2.css()}>
                <Text color="black" size="0.8rem">
                  {labels[1]}
                </Text>
              </Box>
              <Box margin="2px" align="center" background={DEN_COLOR_3.css()}>
                <Text color="black" size="0.8rem">
                  {labels[2]}
                </Text>
              </Box>
              <Box margin="2px" align="center" background={DEN_COLOR_4.css()}>
                <Text color="black" size="0.8rem">
                  {labels[3]}
                </Text>
              </Box>
            </Box>
          </Box>
        </TextFrame>
      </Box>
    );
  }
}
