import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sidemenuActions, userActions } from '../../_actions';
import Input from '../../_components/input';
import Layout from '../../_components/layout';

class User extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {
                name: '',
                userName: '',
                email: '',
                isAdmin: false,
            },
            stateUser: {
                oldPassword:'',
                newPassword:'',
            },
            alert: {
                type: '',
                message: ''
            },
            updating: false,
            menuItem: ''
        }
        this.handleClearAlert = this.handleClearAlert.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('user'));
        if (!!user) {
          this.setState({
            user: user
          });
        } else {
          localStorage.removeItem('user');
          location.reload(true);
        }
    }

    handleClearAlert(event){
        event.preventDefault;
        const { dispatch } = this.props;
        
        this.setState({
          alert: {
            type: '',
            message: ''
          }
        }, () => dispatch(alertActions.clear()));
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
            updating: true
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
        const { alert, sidemenu } = this.props;
        const { user, updating, menuItem, stateUser } = this.state
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
                        <div className="col-lg-4 col-md-12 mb-3">
                            <div className="card">
                                <div className="card-header">Profile Info</div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-borderless" style={{textAlign: 'left'}}>
                                            <tbody>
                                                <tr>
                                                    <th>User Name:</th>
                                                    <td>{user.name}</td>
                                                </tr>
                                                <tr>
                                                    <th>E-mail:</th>
                                                    <td>{user.email}</td>
                                                </tr>
                                                <tr>
                                                    <th>Role:</th>
                                                    <td>{user.isAdmin ? 'Admin' : 'Regular User'}</td>
                                                </tr>
                                                <tr>
                                                    <th>Initials:</th>
                                                    <td>{user.userName}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8 col-md-12">
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
                                            submitted={updating}
                                            inline={false}
                                            required={true}
                                            autoComplete="current-password"
                                        />
                                        <Input
                                            title="New Password"
                                            name="newPassword"
                                            type="password"
                                            value={stateUser.newPassword}
                                            onChange={this.handleChange}
                                            submitted={updating}
                                            inline={false}
                                            required={true}
                                            autoComplete="new-password"
                                        />
                                        <div className="col-12 text-right p-0">
                                            <button type="submit" className="btn btn-leeuwen-blue btn-lg">
                                                <span><FontAwesomeIcon icon={updating ? "spinner" : "hand-point-right"} className={updating ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Submit</span>
                                            </button>
                                        </div>
                                        
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
    return { alert, sidemenu };
}

const connectedUser = connect(mapStateToProps)(User);
export { connectedUser as User };