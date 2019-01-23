import { createModel } from '@rematch/core';
import { find, omit } from 'lodash';

export interface IState {
  textIDs: string[];
  texts: { [textID: string]: IText };
}
export interface IText {
  title: string;
  brief: string;
  text?: string;
  textID: string;
}

const initialState: IState = {
  textIDs: [],
  texts: {},
};
export default createModel({
  state: initialState,
  reducers: {
    loadText(
      state: IState,
      payload: { title: string; brief: string; text: string; textID: string },
    ) {
      state.textIDs.push(payload.textID);
      state.texts[payload.textID] = payload;
      return state;
    },
    loadTextBook(
      state: IState,
      payload: Array<{ title: string; brief: string; textID: string }>,
    ) {
      for (const textBookChapter of payload) {
        state.textIDs.push(textBookChapter.textID);
        state.texts[textBookChapter.textID] = textBookChapter;
      }
      return state;
    },
  },
  effects: {
    /**
     * fetch text book from my SoLiD POD, and load them into rematch local cache one by one
     */
    async fetchTextFromPOD(textID: string) {
      this.loadText({
        textID,
        title: '',
        brief: 'Loading',
        text: 'Loading...',
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const text = find(await import('./text.example.json'), ['textID', textID]);
      this.loadText({ textID, title: '', brief: 'Loaded!', text: 'Loaded!' });
    },
    async fetchTextBookFromPOD(textID: string) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const textList = (await import('./text.example.json')).default.map(obj =>
        omit(obj, ['text']),
      );
      this.loadTextBook(textList);
    },
  },
});
