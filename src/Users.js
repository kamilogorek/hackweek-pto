import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import firebase from "./firebase";
import { isAdmin } from "./util";

class Profile extends Component {
  state = {
    loading: true,
    users: []
  };

  componentWillMount() {
    this.unregisterUsersObserver = firebase
      .firestore()
      .collection("users")
      .orderBy("displayName")
      .onSnapshot(snapshot => {
        const users = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        this.setState({ loading: false, users });
      });
  }

  componentWillUnmount() {
    this.unregisterUsersObserver();
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  updateUser = (event, user) => {
    firebase
      .firestore()
      .collection("users")
      .doc(user.id)
      .update({
        [event.target.name]:
          event.target.type === "number"
            ? parseInt(event.target.value, 10)
            : event.target.value
      })
      .then(() => this.setState({ statusMessage: "Saved" }))
      .catch(() => this.setState({ statusMessage: "Failed to saved" }));
  };

  render = () => {
    if (!this.props.user || !isAdmin(this.props.user)) {
      return <Redirect to={{ pathname: "/" }} />;
    }

    if (this.state.loading) {
      return "Loading...";
    }

    return (
      <div className="row">
        <div className="col">
          <h4>Users</h4>

          <table className="striped">
            <thead>
              <tr>
                <th>Email</th>
                <th>Display Name</th>
                <th>Total Days</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.displayName}</td>
                  <td>
                    <input
                      name="totalDays"
                      type="number"
                      defaultValue={user.totalDays}
                      onBlur={event => this.updateUser(event, user)}
                    />
                  </td>
                  <td>
                    <input
                      name="manager"
                      type="text"
                      defaultValue={user.manager}
                      onBlur={event => this.updateUser(event, user)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {this.state.statusMessage && <p>{this.state.statusMessage}</p>}
        </div>
      </div>
    );
  };
}

export default Profile;
