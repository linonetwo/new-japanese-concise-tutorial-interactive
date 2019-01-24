import { createModel } from '@rematch/core';
import { find, omit, uniq, mapValues } from 'lodash';
import { newEngine } from '@comunica/actor-init-sparql';
import { bindingsStreamToGraphQl } from '@comunica/actor-sparql-serialize-tree';

import ldpContext from './ldpContext.json';

const baseURI =
  'https://new-japanese-concise-tutorial.solid.authing.cn/public/textbook/';
const comunicaEngine = newEngine();
const context = {
  sources: [
    {
      type: 'file',
      value: baseURI,
    },
  ],
  queryFormat: 'graphql',
  '@context': mapValues(ldpContext, value => {
    const [prefix, suffix] = value.split(':');
    if (ldpContext[prefix]) {
      return ldpContext[prefix] + suffix;
    }
    return value;
  }),
};

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
      state.textIDs = uniq(state.textIDs);
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
      state.textIDs = uniq(state.textIDs);
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
      const text = await fetch(textID).then(res => res.text());
      this.loadText({
        textID,
        title: text.split('\n')[0],
        brief: text.substring(0, 20),
        text,
      });
    },
    async fetchTextBookFromPOD() {
      const result = await comunicaEngine.query(
        `{ ... on Container {contains} }`,
        context,
      );
      (result as any).bindingsStream.on('data', data => {
        const {
          '?contains': { id: textID },
        } = data.toObject();
        const title = textID.replace(baseURI, '');
        this.loadTextBook([{ title, textID, brief: '' }]);
      });
    },
  },
});
