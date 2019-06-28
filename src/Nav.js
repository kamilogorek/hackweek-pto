import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "./logo.png";

import { isAdmin } from "./util";
import firebase, { provider } from "./firebase";

class Nav extends Component {
  login = () => firebase.auth().signInWithPopup(provider);
  logout = () => firebase.auth().signOut();

  render = () => {
    return (
      <div className="row">
        <div className="col">
          <div className="logo-wrapper">
            <Link to="/" className="logo">
              <img src={logo} alt="" />
              <span>Hackweek&nbsp;PTO</span>
            </Link>
          </div>

          {this.props.user ? (
            <div className="tabs is-full">
              <NavLink to="/profile">
                <img
                  src={this.props.user.photo}
                  className="profile-photo"
                  alt=""
                />
                Profile
              </NavLink>
              <NavLink to="/submit-request">Submit&nbsp;Request</NavLink>
              <NavLink to="/requests">My Requests</NavLink>
              {isAdmin(this.props.user) && <NavLink to="/users">Users</NavLink>}
              {isAdmin(this.props.user) && (
                <NavLink to="/pending-requests">Pending&nbsp;Request</NavLink>
              )}
              {isAdmin(this.props.user) && (
                <NavLink to="/past-requests">Past&nbsp;Request</NavLink>
              )}
              <Link to="/" onClick={this.logout}>
                Logout
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    );
  };
}

export default Nav;
