import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { iRootState, Dispatch } from './store';

import Panel from './Panel';
import Menu from './Menu';

const Container = styled.div``;

type ConnectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
class App extends PureComponent<ConnectedProps> {
  public componentWillMount() {
    this.props.fetchTextBookFromPOD();
  }
  public render() {
    return (
      <Container>
        <Menu />
        {this.props.panelIDs.map(id => (
          <Panel key={id} id={id} />
        ))}
      </Container>
    );
  }
}

const mapState = ({ panel: { panelIDs } }: iRootState) => ({
  panelIDs,
});

const mapDispatch = ({ texts: { fetchTextBookFromPOD } }: Dispatch) => ({
  fetchTextBookFromPOD,
});

export default connect(
  mapState,
  mapDispatch,
)(App);
