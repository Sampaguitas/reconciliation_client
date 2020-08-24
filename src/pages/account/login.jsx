import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import config from 'config';
import { sidemenuActions } from "../../_actions";
import InputIcon from "../../_components/input-icon";
import Layout from "../../_components/layout";
import logo from "../../_assets/logo.svg";
import rdb from "../../_assets/rdb.svg";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      loggingIn: false,
      menuItem: '',
      alert: {
        type: '',
        message: ''
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // dispatch(userActions.logout());
    localStorage.removeItem('user');
    dispatch(sidemenuActions.restore());
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }

  handleLogin(event) {
    event.preventDefault();
    const { email, password } = this.state;
    if (!!email && !!password) {
      this.setState({
        loggingIn: true
      }, () => {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        };
        return fetch(`${config.apiUrl}/user/login`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            loggingIn: false,
          }, () => {
            const data = text && JSON.parse(text);
            const error = (data && data.message) || response.statusText;
            if (response.status === 401) {
              // Unauthorized
              localStorage.removeItem('user');
              location.reload(true);
            } else if (!!data.token) {
              localStorage.setItem('user', JSON.stringify(data));
              history.push('/');
            } else {
              this.setState({
                alert: {
                  type: response.status === 200 ? 'alert-success' : 'alert-danger',
                  message: error
                }
              });
            }
          });
        }));
      });
    }
  }

  render() {
    const { sidemenu } = this.props;
    const { email, menuItem, password, loggingIn } = this.state;
    const alert = this.state.alert.message ? this.state.alert : this.props.alert;
    return (
      <Layout sidemenu={sidemenu} menuItem={menuItem}>
        <div
          id="login-card"
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
                onKeyPress={this.onKeyPress}
                onSubmit={this.handleLogin
              }>
                <InputIcon
                  title="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={this.handleChange}
                  placeholder="Email"
                  icon="user"
                  submitted={loggingIn}
                  autoComplete="email"
                />
                <InputIcon
                  title="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={this.handleChange}
                  placeholder="Password"
                  icon="lock"
                  submitted={loggingIn}
                  autoComplete="current-password"
                />
                <hr />
                <button type="submit" className="btn btn-leeuwen btn-full btn-lg" style={{height: '34px'}}> 
                  <span><FontAwesomeIcon icon={loggingIn ? "spinner" : "sign-in-alt"} className={loggingIn ? "fa-pulse fa fa-fw mr-2" : "fa mr-2"}/>Login</span>
                </button>
                <NavLink
                  to={{
                    pathname: "/requestpwd"
                  }}
                  className="btn btn-link" tag="a"
                >
                  Forgot your password?
                </NavLink>
                <br />
                {alert.message && (
                  <div className={`alert ${alert.type}`}>{alert.message}</div>
                )}
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
  // const { loggingIn } = state.authentication;
  return {
    alert,
    sidemenu,
    // loggingIn,
  };
}

const connectedLogin = connect(mapStateToProps)(Login);
export { connectedLogin as Login };
