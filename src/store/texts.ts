import { createModel } from '@rematch/core';
import { find, merge, omit, uniq, mapValues, last } from 'lodash';
import { newEngine } from '@comunica/actor-init-sparql';
import { bindingsStreamToGraphQl } from '@comunica/actor-sparql-serialize-tree';

import ldpContext from './ldpContext.json';
import store from './index';

function expandContext(contextObj: Object, parent: Object = contextObj) {
  return mapValues(contextObj, (value: string | boolean | Object) => {
    if (typeof value === 'object') {
      return expandContext(value, parent);
    }
    if (typeof value === 'string') {
      const [prefix, suffix] = value.split(':');
      if (parent[prefix]) {
        return parent[prefix] + suffix;
      }
      return value;
    }
    return value;
  });
}
// console.log(JSON.stringify(expandContext(ldpContext)));

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
  '@context': expandContext(ldpContext),
};

export interface IState {
  textURIs: string[];
  texts: { [textURI: string]: IText };
}
export interface IText {
  title: string;
  brief: string;
  text?: string;
  textURI: string;
  contentType?: string;
}

const initialState: IState = {
  textURIs: [],
  texts: {},
};
export default createModel({
  state: initialState,
  reducers: {
    loadText(
      state: IState,
      payload: { title: string; brief: string; text: string; textURI: string },
    ) {
      state.textURIs.push(payload.textURI);
      state.textURIs = uniq(state.textURIs);
      state.texts[payload.textURI] = payload;
      return state;
    },
    loadTextBook(
      state: IState,
      payload: Array<{ title: string; brief: string; textURI: string }>,
    ) {
      for (const textBookChapter of payload) {
        state.textURIs.push(textBookChapter.textURI);
        state.texts[textBookChapter.textURI] = merge(
          { ...state.texts[textBookChapter.textURI] },
          textBookChapter,
        );
      }
      state.textURIs = uniq(state.textURIs);
      return state;
    },
  },
  effects: {
    /**
     * fetch text book from my SoLiD POD, and load them into rematch local cache one by one
     */
    async fetchTextFromPOD(textURI: string) {
      this.loadText({
        textURI,
        title: '',
        brief: 'Loading',
        text: 'Loading...',
      });
      const response = await fetch(textURI);
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      this.loadText({
        textURI,
        title: text.split('\n')[0],
        brief: text.substring(0, 20),
        text,
        contentType,
      });
    },
    async fetchTextBookFromPOD() {
      const result = await comunicaEngine.query(
        `{ ... on Container { contains contains { type } } }`,
        context,
      );
      return new Promise(resolve => {
        (result as any).bindingsStream.on('data', data => {
          const {
            '?contains': { id: textURI },
            '?contains_type': { id: containsType },
          } = data.toObject();
          console.log(data.toObject());
          const title = textURI.replace(baseURI, '');
          const getContentType = /http:\/\/www.w3.org\/ns\/iana\/media-types\/(.+)#/;
          const [, contentType] = containsType.match(getContentType) || [
            undefined,
            undefined,
          ];
          this.loadTextBook([{ title, textURI, brief: '', contentType }]);
        });
        (result as any).bindingsStream.on('end', async () => {
          // automation
          const { dispatch, getState } = await import('./');
          const textURI = last(getState().texts.textURIs);
          dispatch.panel.newTab({ textURI });
          resolve();
        });
      });
    },
  },
});
