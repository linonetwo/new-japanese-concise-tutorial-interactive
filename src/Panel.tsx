import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import { Editor, Plugin } from 'slate-react';
import { Value } from 'slate';
import Plain from 'slate-plain-serializer';
import { connect } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { JapaneseParser } from 'nlcst-parse-japanese';

import { iRootState, Dispatch } from './store';
import MarkParsed from './slate-mark-parsed';
import MarkToolTip from './slate-mark-tooltip';

const plugins: Plugin[] = [MarkToolTip()];
const japaneseParser = new JapaneseParser({ dicPath: '/dict' });
japaneseParser.ready().then(() => {
  plugins.push(MarkParsed({ parser: japaneseParser }));
});

const Container = styled.div``;
const TabBar = styled.nav`
  display: flex;
  align-items: center;
  flex-direction: row;
`;
const Tab = styled.div<{ focused: boolean }>`
  height: 35px;
  width: 150px;
  padding-left: 20px;

  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  color: #2a2a2a;
  background-color: #545454;
  ${is('focused')`
    color: #000000;
    background-color: #D2D2D2;
  `}

  font-size: 12px;
`;
const CloseTabButton = styled.button`
  border: none;
  cursor: pointer;
  background-color: transparent;
  display: flex;
`;
const EditorContainer = styled.article`
  padding: 18px 50px;
`;

interface IPanelProps {
  id: string;
}
type ConnectedProps = IPanelProps &
  ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
const Panel: FunctionComponent<ConnectedProps> = ({
  id,
  currentTabID,
  tabs,
  closeTab,
  loadTextToPanel,
  switchTab,
  text,
}) => {
  return (
    <Container>
      <TabBar>
        {tabs.map(({ tabID, title, textURI }) => (
          <Tab
            key={tabID}
            focused={tabID === currentTabID}
            onClick={() => {
              switchTab({ panelID: id, tabID });
              loadTextToPanel({ panelID: id, textURI });
            }}
          >
            <span>{title}</span>
            <CloseTabButton
              onClick={event => {
                event.stopPropagation();
                closeTab({ panelID: id, tabID });
              }}
            >
              <FaTimes />
            </CloseTabButton>
          </Tab>
        ))}
      </TabBar>
      <EditorContainer>
        <Editor value={Plain.deserialize(text)} plugins={plugins} spellCheck={false} />
      </EditorContainer>
    </Container>
  );
};

const mapState = (
  { panel: { panels }, texts: { texts } }: iRootState,
  props: IPanelProps,
) => {
  const currentPanel = panels[props.id];
  return {
    currentTabID: currentPanel.currentTabID,
    tabs: currentPanel.tabIDs
      .map(id => currentPanel.tabs[id])
      .map(({ textURI, ...rest }) => ({
        title: texts[textURI].title,
        textURI,
        ...rest,
      })),
    text:
      (currentPanel.currenttextURI && texts[currentPanel.currenttextURI].text) ||
      '',
  };
};

const mapDispatch = ({
  panel: { closeTab, loadTextToPanel, switchTab },
}: Dispatch) => ({
  closeTab,
  loadTextToPanel,
  switchTab,
});

export default connect(
  mapState,
  mapDispatch,
)(Panel);
