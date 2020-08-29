import { combineReducers } from 'redux';
import { alert } from './alert.reducer';
import { sidemenu } from './sidemenu.reducer';

const rootReducer = combineReducers({
  alert,
  sidemenu,
});

export default rootReducer;