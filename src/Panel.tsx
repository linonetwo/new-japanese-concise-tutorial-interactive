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
import MarkIntellisense from './slate-mark-intellisense';

const plugins: Plugin[] = [MarkIntellisense()];
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
        {tabs.map(({ tabID, title, textID }) => (
          <Tab
            key={tabID}
            focused={tabID === currentTabID}
            onClick={() => {
              switchTab({ panelID: id, tabID });
              loadTextToPanel({ panelID: id, textID });
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
        <Editor value={Plain.deserialize(text)} plugins={plugins} />
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
