import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";

import firebase from "./firebase";
import { defaultTotalDays } from "./config";

import Nav from "./Nav";
import Main from "./Main";
import Profile from "./Profile";
import Users from "./Users";
import SubmitRequest from "./SubmitRequest";
import Requests from "./Requests";
import PendingRequests from "./PendingRequests";
import PastRequests from "./PastRequests";

function PrivateRoute({ component: Component, user, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        user ? (
          <Component {...props} user={user} />
        ) : (
          <Redirect
            to={{
              pathname: "/"
            }}
          />
        )
      }
    />
  );
}

class App extends Component {
  state = {
    loading: true,
    user: null
  };

  componentDidMount() {
    this.unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(this.handleAuthStateChange);
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  handleAuthStateChange = async auth => {
    if (!auth) {
      this.setState({ loading: false, user: null });
      return;
    }

    if (this.unregisterUserObserver) this.unregisterUserObserver();

    this.unregisterUserObserver = firebase
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .onSnapshot(snapshot => {
        if (!snapshot.exists) return;

        this.setState({
          loading: false,
          user: {
            ...snapshot.data(),
            id: snapshot.id
          }
        });
      });

    const userAlreadyExist = await this.doesUserAlreadyExist(auth);

    if (!userAlreadyExist) {
      await this.createUser(auth);
    }
  };

  doesUserAlreadyExist = async auth => {
    const snapshot = await firebase
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .get();

    return snapshot.exists;
  };

  createUser = async auth => {
    const userCreated = await firebase
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .set({
        displayName: auth.displayName,
        email: auth.email,
        photo: auth.photoURL,
        totalDays: defaultTotalDays
      });

    return userCreated;
  };

  render = () => {
    if (this.state.loading === true) {
      return <div className="container">Loading...</div>;
    }

    return (
      <div className="container">
        <Router>
          <Nav user={this.state.user} />

          <Switch>
            <Route
              exact
              path="/"
              render={() => <Main user={this.state.user} />}
            />
            <PrivateRoute
              path="/profile"
              user={this.state.user}
              component={Profile}
            />
            <PrivateRoute
              path="/submit-request"
              user={this.state.user}
              component={SubmitRequest}
            />
            <PrivateRoute
              path="/requests"
              user={this.state.user}
              component={Requests}
            />
            <PrivateRoute
              path="/users"
              user={this.state.user}
              component={Users}
            />
            <PrivateRoute
              path="/pending-requests"
              user={this.state.user}
              component={PendingRequests}
            />
            <PrivateRoute
              path="/past-requests"
              user={this.state.user}
              component={PastRequests}
            />
            <Route
              render={() => (
                <Redirect
                  to={{
                    pathname: "/"
                  }}
                />
              )}
            />
          </Switch>
        </Router>
      </div>
    );
  };
}

export default App;
