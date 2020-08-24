import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  sidemenuActions,
  userActions 
} from "../../_actions";
import InputIcon from "../../_components/input-icon";
import Layout from "../../_components/layout";
import logo from "../../_assets/logo.svg";
import pdb from "../../_assets/pdb.svg";

class Login extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(userActions.logout());
    this.state = {
      email: "",
      password: "",
      submitted: false,
      menuItem: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(userActions.logout());
    dispatch(sidemenuActions.restore());
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ submitted: true });
    const { email, password } = this.state;
    const { dispatch } = this.props;
    if (email && password) {
      dispatch(userActions.login(email, encodeURI(password)));
    }
  }

  onKeyPress(event) {
    if (event.which === 13 /* prevent form submit on key Enter */) {
      event.preventDefault();
    }
  }

  render() {
    const { alert, loggingIn, sidemenu  } = this.props;
    const { email, menuItem, password, submitted } = this.state;
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
              <img src={pdb} className="img-fluid" alt="Project Database" />
              <hr />
              <form
                name="form"
                onKeyPress={this.onKeyPress}
                onSubmit={this.handleSubmit
              }>
                <InputIcon
                  title="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={this.handleChange}
                  placeholder="Email"
                  icon="user"
                  submitted={submitted}
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
                  submitted={submitted}
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
  const { loggingIn } = state.authentication;
  return {
    alert,
    sidemenu,
    loggingIn,
  };
}

const connectedLogin = connect(mapStateToProps)(Login);
export { connectedLogin as Login };
