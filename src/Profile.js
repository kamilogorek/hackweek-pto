import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import firebase from "./firebase";

class Profile extends Component {
  state = {
    loading: true,
    manager: "",
    daysUsed: 0
  };

  componentWillMount() {
    this.unregisterRequestsObserver = firebase
      .firestore()
      .collection("requests")
      .where("email", "==", this.props.user.email)
      .onSnapshot(snapshot => {
        const docs = snapshot.docs;

        const pending = docs
          .map(doc => doc.data())
          .filter(request => request.approved === null);

        const approved = docs
          .map(doc => doc.data())
          .filter(request => request.approved === true);

        const rejected = docs
          .map(doc => doc.data())
          .filter(request => request.approved === false);

        this.setState({
          loading: false,
          pendingRequests: pending.length,
          pendingDays: pending.reduce((acc, day) => acc + day.totalDays, 0),
          approvedRequests: approved.length,
          approvedDays: approved.reduce((acc, day) => acc + day.totalDays, 0),
          rejectedRequests: rejected.length,
          rejectedDays: rejected.reduce((acc, day) => acc + day.totalDays, 0)
        });
      });
  }

  componentWillUnmount() {
    this.unregisterRequestsObserver();
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();

    firebase
      .firestore()
      .collection("users")
      .doc(this.props.user.id)
      .update({ manager: this.state.manager })
      .then(() => this.setState({ statusMessage: "Saved" }))
      .catch(() => this.setState({ statusMessage: "Failed to saved" }));
  };

  render = () => {
    if (!this.props.user) {
      return <Redirect to={{ pathname: "/" }} />;
    }

    if (this.state.loading) {
      return "Loading...";
    }

    return (
      <div className="row">
        <div className="col-6">
          <h4>Settings</h4>

          <form onSubmit={this.handleSubmit}>
            <fieldset>
              <legend>Settings</legend>
              <p>
                <label>Manager:</label>
                <input
                  name="manager"
                  type="text"
                  defaultValue={this.props.user.manager}
                  onChange={this.handleChange}
                />
              </p>

              {this.state.statusMessage && <p>{this.state.statusMessage}</p>}

              <p>
                <input type="submit" value="Submit" />
              </p>
            </fieldset>
          </form>

          <h4>Statistics</h4>
          <ul>
            <li>Total days: {this.props.user.totalDays}</li>
            <li>
              Remaining days:{" "}
              {this.props.user.totalDays - this.state.approvedDays}
            </li>
            <li>Pending requests: {this.state.pendingRequests}</li>
            <li>Pending days: {this.state.pendingDays}</li>
            <li>Approved requests: {this.state.approvedRequests}</li>
            <li>Approved days: {this.state.approvedDays}</li>
            <li>Rejected requests: {this.state.rejectedRequests}</li>
            <li>Rejected days: {this.state.rejectedDays}</li>
          </ul>
        </div>
      </div>
    );
  };
}

export default Profile;
