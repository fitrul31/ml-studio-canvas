import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import { compose } from 'redux';

import { createInitialState } from "./helpers/createInitialState";
import { selectionReducer } from "./selection/selectionReducer";
import { globalReducer } from "./global/globalReducer";
import { nodeReducer } from "./node/nodeReducer";
import { wireReducer } from "./wire/wireReducer";
import { textReducer } from "./text/textReducer";
import { undoable } from "./undo/undoable";

const reducer = (state = createInitialState(), action) => {
  if (action.type.startsWith("S/")) {
    return selectionReducer(state, action);
  } else if (action.type.startsWith("G/")) {
    return globalReducer(state, action);
  } else if (action.type.startsWith("N/")) {
    return nodeReducer(state, action);
  } else if (action.type.startsWith("W/")) {
    return wireReducer(state, action);
  } else if (action.type.startsWith("T/")) {
    return textReducer(state, action);
  } else {
    return state;
  }
};

const undoableReducer = undoable(reducer);

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  undoableReducer,
  composeEnhancer(applyMiddleware(thunk))
);

export default store;
