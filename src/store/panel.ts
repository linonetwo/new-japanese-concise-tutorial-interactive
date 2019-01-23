import { createModel } from '@rematch/core';
import { iRootState } from './';

export interface IState {
  panelIDs: string[];
  panels: { [panelID: string]: IPanelConfig };
}
export interface IPanelConfig {
  tabIDs: string[];
  tabs: {
    [tabID: string]: ITabConfig;
  };
  widthPx?: number;
  currentTextID?: string | null;
}
export interface ITabConfig {
  textID: string;
  tabID: string;
}

const initialState: IState = {
  panelIDs: [],
  panels: {},
};
export default createModel({
  state: initialState,
  reducers: {
    newPanel(state: IState, textID?: string) {
      const newPanelID = String(Math.random());
      const newTabID = String(Math.random());
      state.panelIDs.push(newPanelID);
      // if given a textID, open it in a new tab in this panel
      let newPanelConfig: IPanelConfig;
      if (textID) {
        newPanelConfig = {
          tabIDs: [newTabID],
          tabs: {
            [newTabID]: {
              textID,
              tabID: newTabID,
            },
          },
          currentTextID: textID,
        };
      } else {
        newPanelConfig = {
          tabIDs: [],
          tabs: {},
          currentTextID: null,
        };
      }
      state.panels[newPanelID] = newPanelConfig;
      return state;
    },
    addTabToPanel(
      state: IState,
      payload: { panelID: string; tabID: string; tabConfig: ITabConfig },
    ) {
      state.panels[payload.panelID].tabs[payload.tabID] = payload.tabConfig;
      state.panels[payload.panelID].tabIDs.push(payload.tabID);
      return state;
    },
    loadTextToPanel(
      state: IState,
      payload: { panelID: string; textID: string },
    ) {
      state.panels[payload.panelID].currentTextID = payload.textID;
      return state;
    },
    closeTab(
      state: IState,
      { panelID, tabID }: { panelID: string; tabID: string },
    ) {
      const { textID } = state.panels[panelID].tabs[tabID];
      delete state.panels[panelID].tabs[tabID];
      state.panels[panelID].tabIDs = state.panels[panelID].tabIDs.filter(
        id => id !== tabID,
      );
      // clear current text if closed tab is previously focused tab
      if (state.panels[panelID].currentTextID === textID) {
        state.panels[panelID].currentTextID = null;
      }
      return state;
    },
  },
  effects: {
    /**
     * open a new tab in a panel, and load a text with given ID into this tab
     */
    newTab(payload: { panelID?: string; textID: string }, { panel: state }) {
      // initially there is no panel, so create one
      if (state.panelIDs.length === 0) {
        this.newPanel(payload.textID);
      } else {
        // or add tab to existed panel, add to first panel or a provided panel
        let panelID = state.panelIDs[0];
        if (payload.panelID && state.panelIDs.includes(payload.panelID)) {
          panelID = payload.panelID;
        }
        const newTabID = String(Math.random());
        const tabConfig: ITabConfig = {
          textID: payload.textID,
          tabID: newTabID,
        };
        this.addTabToPanel({
          panelID,
          tabID: newTabID,
          tabConfig,
        });
      }

      // load text into panel
      this.loadTextToPanel(payload);
    },
  },
});
