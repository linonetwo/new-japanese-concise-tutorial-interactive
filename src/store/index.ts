import { init, RematchRootState } from '@rematch/core';
import immerPlugin from '@rematch/immer';

import texts from './texts';
import panel from './panel';

const models = {
  texts,
  panel,
};
const store = init({
  models,
  plugins: [immerPlugin()],
});

export default store;
export const { dispatch } = store;
export type Store = typeof store;
export type Dispatch = typeof store.dispatch;
export type iRootState = RematchRootState<typeof models>;
