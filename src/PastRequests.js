import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import firebase from "./firebase";
import { isAdmin, sortBy } from "./util";

class PastRequests extends Component {
  state = {
    loading: true,
    requests: []
  };

  componentWillMount() {
    this.unregisterRequestsObserver = firebase
      .firestore()
      .collection("requests")
      .where("manager", "==", this.props.user.email)
      .onSnapshot(snapshot => {
        const requests = snapshot.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id
          }))
          .filter(doc => doc.approved !== null)
          .sort(sortBy("timestamp"));

        this.setState({ loading: false, requests });
      });
  }

  componentWillUnmount() {
    this.unregisterRequestsObserver();
  }

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
          <h4>Past Requests</h4>

          {this.state.requests.length === 0 ? (
            "No requests"
          ) : (
            <table className="striped">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total Days</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {this.state.requests.map(request => (
                  <tr key={request.id}>
                    <td>{request.email}</td>
                    <td>{request.start}</td>
                    <td>{request.end}</td>
                    <td>{request.totalDays}</td>
                    <td>{request.description}</td>
                    <td>{request.approved ? "Approved" : "Declined"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };
}

export default PastRequests;
