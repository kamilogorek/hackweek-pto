import React, { Component } from "react";
import { Link } from "react-router-dom";

import firebase, { provider } from "./firebase";

class Main extends Component {
  login = () => firebase.auth().signInWithPopup(provider);

  render = () => {
    if (!this.props.user) {
      return (
        <div className="row">
          <div className="col splash">
            <button className="button primary" onClick={this.login}>
              Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="row">
        <div className="col splash">
          <p>
            Hello, {this.props.user.displayName}, is it time for some PTO?
            <Link className="button primary" to="/submit-request">
              Submit Request
            </Link>
          </p>
        </div>
      </div>
    );
  };
}

export default Main;
