import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sidemenuActions, userActions } from '../../_actions';
import { Input, Layout } from '../../_components';

class User extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            stateUser: {
                oldPassword:'',
                newPassword:'',
            },
            submitted:false,
            menuItem: ''
        }
        this.handleClearAlert = this.handleClearAlert.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(userActions.getAll());
    }

    handleClearAlert(event){
        event.preventDefault;
        const { dispatch } = this.props;
        dispatch(alertActions.clear());
    }

    handleChange(event){
        const { name, value } = event.target;
        const { stateUser } = this.state
        this.setState({
            stateUser: {
                ...stateUser,
                [name]:value
            }
        });
    }

    handleSubmit(event){
        event.preventDefault();
        const { stateUser } = this.state
        const { dispatch } = this.props;
        this.setState({
            submitted: true
        });
        if (stateUser.oldPassword && stateUser.newPassword) {
            dispatch(userActions.changePwd(encodeURI(stateUser)));
        }
    }

    onKeyPress(event) {
        if (event.which === 13 /* prevent form submit on key Enter */) {
          event.preventDefault();
        }
    }
    
    toggleCollapse() {
        const { dispatch } = this.props;
        dispatch(sidemenuActions.toggle());
    }

    render() {
        const { alert, sidemenu, user, userUpdating } = this.props;
        const { menuItem, submitted, stateUser } = this.state
        return (
            <Layout sidemenu={sidemenu} toggleCollapse={this.toggleCollapse} menuItem={menuItem}>
                {alert.message && 
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                        </button>
                    </div>
                }
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <NavLink to={{ pathname: '/' }} tag="a">Home</NavLink>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">User Page</li>
                    </ol>
                </nav>
                <div id="user" className={alert.message ? "main-section-alert" : "main-section"}>
                    <div className="row">
                        <div className="col-md-8 col-sm-12 mb-sm-3 pr-md-0">
                            <div className="card mb-3">
                                <div className="card-header">User Details</div>
                                <div className="card-body">
                                    <address>
                                    <strong>{user.name}, {user.userName}</strong><br />
                                    {user.opco}<br />
                                    {user.email}
                                    </address>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-header">My Role</div>
                                <div className="card-body">
                                    <ul>
                                        { user.isAdmin ? <li>Admin</li> :  <li>Regular User</li> }
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-sm-12">
                            <div className="card">
                                <div className="card-header">Change Password</div>
                                <div className="card-body">
                                    <form
                                        onKeyPress={this.onKeyPress}
                                        onSubmit={this.handleSubmit}
                                    >
                                        <Input
                                            title="Current Password"
                                            name="oldPassword"
                                            type="password"
                                            value={stateUser.oldPassword}
                                            onChange={this.handleChange}
                                            submitted={submitted}
                                            inline={false}
                                            required={true}
                                            autocomplete="current-password"
                                        />
                                        <Input
                                            title="New Password"
                                            name="newPassword"
                                            type="password"
                                            value={stateUser.newPassword}
                                            onChange={this.handleChange}
                                            submitted={submitted}
                                            inline={false}
                                            required={true}
                                            autocomplete="new-password"
                                        />
                                        <button type="submit" className="btn btn-leeuwen-blue btn-full btn-lg">
                                            <span><FontAwesomeIcon icon={userUpdating ? "spinner" : "hand-point-right"} className={userUpdating ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Submit</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    const { alert, sidemenu } = state;
    const { userUpdating } = state.users;
    const { user } = state.authentication;
    return {
        alert,
        sidemenu,
        user,
        userUpdating,
    };
}

const connectedUser = connect(mapStateToProps)(User);
export { connectedUser as User };