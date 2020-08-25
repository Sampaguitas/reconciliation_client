import React, { Component } from "react";
import { connect } from "react-redux";
import { 
  sidemenuActions
} from "../../_actions";
import Layout from '../../_components/layout';
import logo from "../../_assets/logo.svg";
import rdb from "../../_assets/rdb.svg";

class NotFound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuItem: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    localStorage.removeItem('user');
    dispatch(sidemenuActions.restore())
  }

  handleSubmit(event){
      event.preventDefault();
      window.location.href = "/login";
  }

  render() {
    const { menuItem } = this.state;
    const { sidemenu } = this.props;
    return (
      <Layout sidemenu={sidemenu} menuItem={menuItem}>
        <div
          id="notfound-card"
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
              <h2>#404 Not Found</h2>
              <p>The page requested was not found!</p>
              <p>Click on the button below to go back to the login page.</p>
              <hr />
              <button
                type="submit"
                className="btn btn-leeuwen btn-full btn-lg"
                onClick={this.handleSubmit}
              >
                Go back to login page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  const { alert, sidemenu } = state;
  return {
    alert,
    sidemenu,
  };
}

const connectedNotFound = connect(mapStateToProps)(NotFound);
export { connectedNotFound as NotFound };
