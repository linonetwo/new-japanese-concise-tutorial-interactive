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
        };
      } else {
        newPanelConfig = {
          tabIDs: [],
          tabs: {},
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
    closeTab(state: IState, payload: { panelID: string; tabID: string }) {
      delete state.panels[payload.panelID].tabs[payload.tabID];
      state.panels[payload.panelID].tabIDs = state.panels[
        payload.panelID
      ].tabIDs.filter(tabID => tabID !== payload.tabID);
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
    },
  },
});
