import React, { PureComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Grommet, Stack, Box } from 'grommet';
import styled from 'styled-components';

import theme from '../../theme';

import SiteHeader from '../SiteHeader';
import Content from '../../views/Content';
import Navigation from '../Navigation';
import Background from '../Background';
import MainGrid from './MainGrid';

const Wrapper  = styled.main`
position: relative;
height: 100%;
width: 100%;
overflow: hidden
`
// pages

import Home from '../pages/Home';

export default class Main extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Wrapper id="wrapper">
        <Background />
        <Grommet theme={theme} full className="site-frame">
            <MainGrid>
              <Box className="site-header" gridArea="header">
                <SiteHeader />
              </Box>
              <Box gridArea="nav">
                <Navigation />
              </Box>
              <Box gridArea="main">
                <Content>
                  <Switch>
                    <Route path="/">
                      <Home />
                    </Route>
                    <Route>
                      <Home />
                    </Route>
                  </Switch>
                </Content>
              </Box>
            </MainGrid>
        </Grommet>
      </Wrapper>
    );
  }
}
