import React from "react";
import { connect } from "react-redux";
import { NavLink } from 'react-router-dom';
import queryString from 'query-string';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import config from 'config';
import { sidemenuActions } from "../../_actions";
import InputIcon from "../../_components/input-icon";
import Layout from "../../_components/layout";
import logo from "../../_assets/logo.jpg"; //logo.svg
import rdb from "../../_assets/rdb.svg";

class ResetPwd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        user: {
            userId: '',
            token: '',
            newPassword: '',
        },
        resetting: false,
        menuItem: '',
        alert: {
          type: '',
          message: ''
        }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  componentDidMount() {
    const { location, dispatch } = this.props;
    const { user } = this.state;
    var qs = queryString.parse(location.search);
    if (qs.id && qs.token) {
        this.setState({
            user: {
                ...user,
                userId: qs.id,
                token: qs.token
            }
        });
    }
    localStorage.removeItem('user');
    dispatch(sidemenuActions.restore());
  }

  handleChange(event) {
    const { user } = this.state;
    const { name, value } = event.target;
    this.setState({
        user: {
            ...user,
            [name]: value
        }
    });
  }

  handleReset(event) {
    event.preventDefault();
    const { user, resetting } = this.state;
    // const { dispatch } = this.props;
    if (!!user.userId && !!user.token && !!user.newPassword && !resetting) {
      this.setState({
        resetting: true
      }, () => {
        const requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        };
        return fetch(`${config.apiUrl}/user/resetPwd`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            resetting: false,
          }, () => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 401) {
              // Unauthorized
              localStorage.removeItem('user');
              location.reload(true);
            } else {
              this.setState({
                alert: {
                  type: response.status === 200 ? 'alert-success' : 'alert-danger',
                  message: resMsg
                }
              });
            }
          });
        }).catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        }));
      });
    }
  }

  render() {
    const { sidemenu } = this.props;
    const { user, menuItem, resetting } = this.state;
    const alert = this.state.alert.message ? this.state.alert : this.props.alert;
    return (
      <Layout sidemenu={sidemenu} menuItem={menuItem}>
            <div
              id="resetpwd-card"
              className="row justify-content-center align-self-center"
            >
            <div className="card card-login">
                <div className="card-body">
                    <img
                        src={logo}
                        className="img-fluid"
                        alt="Van Leeuwen Pipe and Tube"
                    />
                    <br />
                    <img src={rdb} className="img-fluid mt-2" alt="Reconciliation Database" />
                    <hr />
                    <form
                        name="form"
                        onSubmit={this.handleReset}
                    >
                        <InputIcon
                            title="New Password"
                            name="newPassword"
                            type="password"
                            value={user.newPassword}
                            onChange={this.handleChange}
                            placeholder="New Password"
                            icon="lock"
                            resetting={resetting}
                            autoComplete="new-password"
                            required
                        />
                        <hr />
                        <button type="submit" className="btn btn-leeuwen btn-full btn-lg">
                          <span><FontAwesomeIcon icon={resetting ? "spinner" : "hand-point-right"} className={resetting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Reset</span>
                        </button>
                        <NavLink to={{ pathname: "/login" }} className="btn btn-link" tag="a">Go back to login page</NavLink>
                        <br />
                        {alert.message && <div className={`alert ${alert.type}`}>{alert.message}</div>}
                    </form>
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

const connectedResetPwd = connect(mapStateToProps)(ResetPwd);
export { connectedResetPwd as ResetPwd };
