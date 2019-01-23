import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import Plain from 'slate-plain-serializer';
import { connect } from 'react-redux';
import { iRootState, Dispatch } from './store';

const Container = styled.div``;
const TabBar = styled.nav``;
const Tab = styled.div`
  height: 35px;
  width: 150px;
  display: flex;
  align-items: center;
`;

interface IPanelProps {
  id: string;
}
type ConnectedProps = IPanelProps &
  ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
const Panel: FunctionComponent<ConnectedProps> = ({
  id,
  tabs,
  closeTab,
  loadTextToPanel,
  text,
}) => {
  return (
    <Container>
      <TabBar>
        {tabs.map(({ tabID, title, textID }) => (
          <Tab
            key={tabID}
            onClick={() => loadTextToPanel({ panelID: id, textID })}
          >
            {title}
            <button
              onClick={event => {
                event.stopPropagation();
                closeTab({ panelID: id, tabID });
              }}
            >
              x
            </button>
          </Tab>
        ))}
      </TabBar>
      <Editor value={Plain.deserialize(text)} />
    </Container>
  );
};

const mapState = (
  { panel: { panels }, texts: { texts } }: iRootState,
  props: IPanelProps,
) => {
  const currentPanel = panels[props.id];
  return {
    tabs: currentPanel.tabIDs
      .map(id => currentPanel.tabs[id])
      .map(({ textID, ...rest }) => ({
        title: texts[textID].title,
        textID,
        ...rest,
      })),
    text:
      (currentPanel.currentTextID && texts[currentPanel.currentTextID].text) ||
      '',
  };
};

const mapDispatch = ({ panel: { closeTab, loadTextToPanel } }: Dispatch) => ({
  closeTab,
  loadTextToPanel,
});

export default connect(
  mapState,
  mapDispatch,
)(Panel);
