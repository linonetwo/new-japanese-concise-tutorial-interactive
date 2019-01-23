import { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { connect } from 'react-redux';
import { iRootState, Dispatch } from './store';

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                object: 'leaf',
                text: 'A line of text in a paragraph.',
              },
            ],
          },
        ],
      },
    ],
  },
});

const Container = styled.div``;
const TabBar = styled.nav``;
const Tab = styled.button``;

interface IPanelProps {
  id: string;
}
type ConnectedProps = IPanelProps &
  ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
const Panel: FunctionComponent<ConnectedProps> = ({ id, tabs, closeTab }) => {
  return (
    <Container>
      <TabBar>
        {tabs.map(({ tabID }) => (
          <Tab key={tabID}>
            第一课{' '}
            <button onClick={() => closeTab({ panelID: id, tabID })}>x</button>
          </Tab>
        ))}
      </TabBar>
      <Editor value={initialValue} />
    </Container>
  );
};

const mapState = ({ panel: { panels } }: iRootState, props: IPanelProps) => ({
  tabs: panels[props.id].tabIDs.map(id => panels[props.id].tabs[id]),
});

const mapDispatch = ({ panel: { closeTab } }: Dispatch) => ({
  closeTab,
});

export default connect(
  mapState,
  mapDispatch,
)(Panel);
