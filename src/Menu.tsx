import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import { isNot } from 'styled-is';
import { iRootState, Dispatch } from './store';

const ToggleMenu = styled.button``;
const MenuContainer = styled.nav<{ opened?: boolean }>`
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.2);
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  ${isNot('opened')`
    display: none;
  `}
`;

type ConnectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
class Menu extends Component<ConnectedProps> {
  public state = {
    opened: false,
  };
  public render() {
    const { opened } = this.state;
    return (
      <>
        <ToggleMenu onClick={() => this.setState({ opened: !opened })}>
          三
        </ToggleMenu>
        <MenuContainer opened={opened}>
          {this.props.titles.map(({ title, brief, textID }) => (
            <div onClick={() => this.props.newTab({ textID })}>
              <div>{title}</div>
              <div>{brief}</div>
            </div>
          ))}
        </MenuContainer>
      </>
    );
  }
}

const mapState = ({ texts: { textIDs, texts } }: iRootState) => ({
  titles: textIDs.map(id => texts[id]),
});
const mapDispatch = ({ panel: { newTab } }: Dispatch) => ({
  newTab,
});

export default connect(mapState, mapDispatch)(Menu);
