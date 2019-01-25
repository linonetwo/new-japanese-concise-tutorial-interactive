import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { CircleLoader } from 'react-spinners';
import { connect } from 'react-redux';
import { iRootState, Dispatch } from './store';

import Panel from './Panel';
import Menu from './Menu';

const Container = styled.div``;
const loadingSize = 150;
const LoadingContainer = styled.div`
  position: fixed;
  top: calc(50vh - ${150}px / 2);
  left: calc(50vw - ${150}px / 2);
`;

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
        <LoadingContainer>
          <CircleLoader
            sizeUnit={'px'}
            size={loadingSize}
            loading={this.props.loading}
          />
        </LoadingContainer>
        {this.props.panelIDs.map(id => (
          <Panel key={id} id={id} />
        ))}
      </Container>
    );
  }
}

const mapState = ({
  panel: { panelIDs },
  loading: {
    effects: { texts },
  },
}: iRootState) => ({
  panelIDs,
  loading: Boolean(texts.fetchTextBookFromPOD || texts.fetchTextFromPOD),
});

const mapDispatch = ({ texts: { fetchTextBookFromPOD } }: Dispatch) => ({
  fetchTextBookFromPOD,
});

export default connect(
  mapState,
  mapDispatch,
)(App);
