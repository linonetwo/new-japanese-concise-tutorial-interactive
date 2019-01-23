import { createModel } from '@rematch/core';

export interface IState {
  textIDs: string[];
  texts: { [textID: string]: string };
}

export default createModel({
  state: {
    textIDs: [],
    texts: {},
  },
  reducers: {
    loadText(state: IState, { text, id }: { text: string; id: string }) {
      state.textIDs.push(id);
      state.texts[id] = text;
      return state;
    },
  },
  effects: {
    /**
     * fetch text book from my SoLiD POD, and load them into rematch local cache one by one
     */
    async fetchTextFromPOD(state: IState, textID: string) {
      this.loadText({ id: textID, text: 'Loading...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.loadText({ id: textID, text: 'Loaded!' });
    },
  },
});
