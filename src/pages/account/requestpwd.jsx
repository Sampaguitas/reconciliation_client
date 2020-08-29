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

class RequestPwd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      requesting: false,
      menuItem: '',
      alert: {
        type: '',
        message: ''
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    localStorage.removeItem('user');
    dispatch(sidemenuActions.restore());
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }

  handleRequest(e) {
    event.preventDefault();
    const { email, requesting } = this.state;
    if (!!email && !requesting) {
      this.setState({
        requesting: true
      }, () => {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({email})
        };
        return fetch(`${config.apiUrl}/user/requestPwd`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            requesting: false,
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
        }));
      });
    }
  }

  render() {
    const { sidemenu } = this.props;
    const { email, menuItem, requesting } = this.state;
    const alert = this.state.alert.message ? this.state.alert : this.props.alert;
    return (
      <Layout sidemenu={sidemenu} menuItem={menuItem}>
            <div
              id="requestpwd-card"
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
                    <p>Please provide your email address and we'll send you instructions on how to change your password.</p>
                    <form
                        name="form"
                        onSubmit={this.handleRequest}
                    >
                        <InputIcon
                          title="Email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={this.handleChange}
                          placeholder="Email"
                          icon="user"
                          requesting={requesting}
                          autoComplete="email"
                        />
                        <hr />
                        <button type="submit" className="btn btn-leeuwen btn-full btn-lg">
                          <span><FontAwesomeIcon icon={requesting ? "spinner" : "hand-point-right"} className={requesting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Submit</span>
                        </button>
                        <NavLink to={{ pathname: "/login" }} className="btn btn-link" tag="a"> Go back to login page</NavLink>
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

const connectedRequestPwd = connect(mapStateToProps)(RequestPwd);
export { connectedRequestPwd as RequestPwd };
