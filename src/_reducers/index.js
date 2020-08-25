import { combineReducers } from 'redux';
import { alert } from './alert.reducer';
// import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
// import { requestpwd } from './requestpwd.reducer';
// import { resetpwd } from './resetpwd.reducer';
import { settings } from './settings.reducer';
import { sidemenu } from './sidemenu.reducer';

const rootReducer = combineReducers({
  alert,
  // authentication,
  registration,
  // requestpwd,
  // resetpwd,
  settings,
  sidemenu,
});

export default rootReducer;