import { init, RematchRootState } from '@rematch/core';
import immerPlugin from '@rematch/immer';
import createLoadingPlugin from '@rematch/loading';

import texts from './texts';
import panel from './panel';

const models = {
  texts,
  panel,
};
const store = init({
  models,
  plugins: [immerPlugin(), createLoadingPlugin()],
});

export default store;
export const { dispatch, getState } = store;

export type Store = typeof store;
export type Dispatch = typeof store.dispatch;
interface ILoadingPlugin {
  loading: {
    models: RematchRootState<typeof models>;
    effects: Dispatch;
  };
}
export type iRootState = RematchRootState<typeof models> & ILoadingPlugin;
