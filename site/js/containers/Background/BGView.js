import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const Frame = styled.div`
margin: 0;
overflow: hidden;
background-color: black;
width: 100%;
height: 100%;
position: absolute;
top: 0;
left: 0;
z-index: -100;
`;

export default class BGView extends PureComponent {
  render() {
    return (
      <>
        <Frame ref={this.props.reference} />    {this.props.children}
      </>
    );
  }
}
