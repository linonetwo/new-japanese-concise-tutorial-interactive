import { createModel } from '@rematch/core';
import { last } from 'lodash';

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
  currentTabID: string | null;
  currenttextURI: string | null;
}
export interface ITabConfig {
  textURI: string;
  tabID: string;
}

const initialState: IState = {
  panelIDs: [],
  panels: {},
};
export default createModel({
  state: initialState,
  reducers: {
    newPanel(state: IState, textURI?: string) {
      const newPanelID = String(Math.random());
      const newTabID = String(Math.random());
      state.panelIDs.push(newPanelID);
      // if given a textURI, open it in a new tab in this panel
      let newPanelConfig: IPanelConfig;
      if (textURI) {
        newPanelConfig = {
          tabIDs: [newTabID],
          tabs: {
            [newTabID]: {
              textURI,
              tabID: newTabID,
            },
          },
          currenttextURI: textURI,
          currentTabID: newTabID,
        };
      } else {
        newPanelConfig = {
          tabIDs: [],
          tabs: {},
          currenttextURI: null,
          currentTabID: null,
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
      state.panels[payload.panelID].currentTabID = payload.tabID;
      return state;
    },
    loadTextToPanel(
      state: IState,
      payload: { panelID: string; textURI: string },
    ) {
      state.panels[payload.panelID].currenttextURI = payload.textURI;
      return state;
    },
    switchTab(
      state: IState,
      payload: { panelID: string; tabID: string },
    ) {
      state.panels[payload.panelID].currentTabID = payload.tabID;
      return state;
    },
    closeTab(
      state: IState,
      { panelID, tabID }: { panelID: string; tabID: string },
    ) {
      const { textURI } = state.panels[panelID].tabs[tabID];
      delete state.panels[panelID].tabs[tabID];
      state.panels[panelID].tabIDs = state.panels[panelID].tabIDs.filter(
        id => id !== tabID,
      );
      // clear current text if closed tab was last tab
      if (state.panels[panelID].currenttextURI === textURI) {
        state.panels[panelID].currenttextURI = null;
        state.panels[panelID].currentTabID = null;
      }
      // load text if there is a remaining tab
      const lastTabID = last(state.panels[panelID].tabIDs);
      if (lastTabID) {
        state.panels[panelID].currentTabID = lastTabID;
        state.panels[panelID].currenttextURI =
          state.panels[panelID].tabs[lastTabID].textURI;
      }
      return state;
    },
  },
  effects: {
    /**
     * open a new tab in a panel, and load a text with given ID into this tab
     */
    async newTab(
      payload: { panelID?: string; textURI: string },
      { panel: state },
    ) {
      // initially there is no panel, so create one
      if (state.panelIDs.length === 0) {
        this.newPanel(payload.textURI);
        const newPanelIDs = (await import('./')).default.getState().panel
          .panelIDs[0];
        this.loadTextToNewTabOfPanel({
          panelID: newPanelIDs,
          ...payload,
        });
      } else {
        // or add tab to existed panel, add to first panel or a provided panel
        let panelID = state.panelIDs[0];
        if (payload.panelID && state.panelIDs.includes(payload.panelID)) {
          panelID = payload.panelID;
        }
        const newTabID = String(Math.random());
        const tabConfig: ITabConfig = {
          textURI: payload.textURI,
          tabID: newTabID,
        };
        this.addTabToPanel({
          panelID,
          tabID: newTabID,
          tabConfig,
        });
        this.loadTextToNewTabOfPanel({ panelID, ...payload });
      }
    },
    async loadTextToNewTabOfPanel(payload: {
      panelID: string;
      textURI: string;
    }) {
      // load text into panel
      this.loadTextToPanel(payload);
      const { dispatch } = await import('./');
      dispatch.texts.fetchTextFromPOD(payload.textURI);
    },
  },
});
