import { persistStore } from 'redux-persist';

import { createStore } from './configureStore';

export const store = createStore();
export const persistor = persistStore(store);

export { createStore };
export type { AppDispatch, AppStore, RootState } from './configureStore';
