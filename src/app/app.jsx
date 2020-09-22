import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

//Redux
import { connect } from 'react-redux';
import { history } from '../_helpers';
import { alertActions } from '../_actions';
// pages
import { PrivateRoute } from '../_components/routes';
import { Home } from '../pages/home/home.jsx';
import { ExportDoc } from '../pages/home/export_doc.jsx';
import { ExportItem } from '../pages/home/export_item.jsx';
import { ImportDoc } from '../pages/home/import_doc.jsx';
import { ImportItem } from '../pages/home/import_item.jsx';

import { Error } from '../pages/account/error.jsx';
import { Login } from '../pages/account/login.jsx';
import { NotFound } from '../pages/account/notfound.jsx';
import { RequestPwd } from '../pages/account/requestpwd';
import { ResetPwd } from '../pages/account/resetpwd';
import { User } from '../pages/account/user.jsx';
import { Settings } from '../pages/account/settings.jsx';


// Styles
import '../_styles/custom-bootsrap.scss';
import '../_styles/main.css';

//Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { far } from '@fortawesome/pro-regular-svg-icons';
import { fal } from '@fortawesome/pro-light-svg-icons';

library.add(fas, far, fal);


class App extends React.Component {
    constructor(props) {
        super(props);
        const { dispatch } = this.props;
        history.listen((location, action) => {
            dispatch(alertActions.clear());
        });
    }

    componentDidMount() {
        if (location.protocol != 'https:' && process.env.NODE_ENV != 'development') {
            location.replace(`https:${location.href.substring(location.protocol.length)}`);
        }
    }

    render() {
        let user = localStorage.getItem("user");
        return (
            <Router history={history}>
                <div>
                    <Switch>
                        <Route path="/error" component={Error} user={user}/>
                        <Route path="/notfound" component={NotFound} user={user}/>
                        <Route path="/login" component={Login} user={user}/>
                        <Route path="/requestpwd" component={RequestPwd} user={user}/>
                        <Route path="/resetpwd" component={ResetPwd} user={user}/>
                        <PrivateRoute exact path="/" component={Home} user={user}/>
                        <PrivateRoute exact path="/export_doc" component={ExportDoc} user={user}/>
                        <PrivateRoute exact path="/export_item" component={ExportItem} user={user}/>
                        <PrivateRoute exact path="/import_doc" component={ImportDoc} user={user}/>
                        <PrivateRoute exact path="/import_item" component={ImportItem} user={user}/>
                        <PrivateRoute path="/user" component={User} user={user}/>
                        <PrivateRoute path="/settings" component={Settings} user={user}/>
                        <Route component={NotFound} user={user}/>
                    </Switch>
                </div>
            </Router>
        );
    }
}

function mapStateToProps(state) {
    const { alert } = state;
    return {
        alert
    };
}

const connectedApp = connect(mapStateToProps)(App);
export { connectedApp as App }; 