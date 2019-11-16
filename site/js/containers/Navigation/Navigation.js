import React, { PureComponent } from 'react';
import {
  Button, DropButton, ResponsiveContext, Box,
} from 'grommet';
import styled from 'styled-components';
import NavGrid from './NavGrid';

const NavItem = styled.div`
margin-top: 1rem;
margin-right: 1rem;
margin-left: -1px;
`;

const NavItemSmall = styled.div`
margin: 2px;
`;
const NavButtonInner = styled(Button)`
text-align: center;
`;
const NavDropButtonInner = styled(DropButton)`
text-align: center;
`;
const NavButton = (props) => (
  <ResponsiveContext.Consumer>
    {(size) => {
      const Container = (size === 'small') ? NavItemSmall : NavItem;
      return (
        <Container>
          <NavButtonInner {...props} plain={false} fill={size !== 'small'}>
            {props.children}
          </NavButtonInner>
        </Container>
      );
    }}
  </ResponsiveContext.Consumer>
);

const NavDropButton = (props) => (
  <ResponsiveContext.Consumer>
    {(size) => {
      const Container = (size === 'small') ? NavItemSmall : NavItem;
      return (
        <Container>
          <NavDropButtonInner
            {...props}
            plain={false}
            dropAlign={{
              top: size === 'small' ? 'bottom' : 'top',
              left: size === 'small' ? 'left' : 'right',
            }}
            dropContent={(
              <Box direction="column" gap="none">
                {props.children}
              </Box>
)}
          >
            {props.children}
          </NavDropButtonInner>
        </Container>
      );
    }}
  </ResponsiveContext.Consumer>
);

export default class Navigation extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { history } = this.props;
    return (
      <NavGrid>
        <NavButton onClick={() => history.push('/')}>
          Home
        </NavButton>
        <NavButton onClick={() => history.push('/create')}>
          Create
        </NavButton>
        <NavButton onClick={() => history.push('/beta')}>
          Beta
        </NavButton>
      </NavGrid>
    );
  }
}
