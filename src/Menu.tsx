import React, { Component } from 'react';
import styled, { keyframes } from 'styled-components';
import { connect } from 'react-redux';
import { isNot } from 'styled-is';
import { iRootState, Dispatch } from './store';

const rotate90 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(90deg);
  }
`;
const buttonRadius = 40;
const ToggleMenu = styled.button<{ opened?: boolean }>`
  border-radius: ${buttonRadius}px;
  width: ${buttonRadius}px;
  height: ${buttonRadius}px;
  border: 0;
  background-color: hotpink;
  opacity: 0.8;
  z-index: 3;
  &:hover {
    opacity: 1;
    ${isNot('opened')`
      animation: ${rotate90} 0.5s forwards;
    `}
  }
  cursor: pointer;

  position: absolute;
  right: 10px;
  top: 10px;
`;
const MenuContainer = styled.nav<{ opened?: boolean }>`
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.6);
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  padding: 100px;

  display: flex;
  flex-direction: row;
  ${isNot('opened')`
    display: none;
  `}
`;
const MenuItem = styled.div`
  margin: 40px;
  padding: 20px;
  background-color: white;
  width: 200px;
  max-height: calc(200px * 0.618);
  h3 {
    text-align: center;
  }
  cursor: pointer;
  opacity: 0.9;
  &:hover {
    opacity: 1;
  }
`;

type ConnectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
class Menu extends Component<ConnectedProps> {
  public state = {
    opened: false,
  };

  public toggleMenu = () => this.setState({ opened: !this.state.opened });
  public render() {
    return (
      <>
        <ToggleMenu opened={this.state.opened} onClick={this.toggleMenu}>
          {this.state.opened ? '川' : '三'}
        </ToggleMenu>
        <MenuContainer opened={this.state.opened} onClick={this.toggleMenu}>
          {this.props.titles.map(({ title, brief, textURI }) => (
            <MenuItem
              key={textURI}
              onClick={() => this.props.newTab({ textURI })}
            >
              <h3>{title}</h3>
              <div>{brief}</div>
            </MenuItem>
          ))}
        </MenuContainer>
      </>
    );
  }
}

const mapState = ({ texts: { textURIs, texts } }: iRootState) => ({
  titles: textURIs.map(id => texts[id]),
});
const mapDispatch = ({ panel: { newTab } }: Dispatch) => ({
  newTab,
});

export default connect(
  mapState,
  mapDispatch,
)(Menu);
