import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import firebase from "./firebase";
import { sortBy } from "./util";

class Requests extends Component {
  state = {
    loading: true,
    requests: []
  };

  componentWillMount() {
    this.unregisterRequestsObserver = firebase
      .firestore()
      .collection("requests")
      .where("email", "==", this.props.user.email)
      .onSnapshot(snapshot => {
        const requests = snapshot.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id
          }))
          .sort(sortBy("timestamp"));

        this.setState({ loading: false, requests });
      });
  }

  componentWillUnmount() {
    this.unregisterRequestsObserver();
  }

  cancelRequest = request => {
    firebase
      .firestore()
      .collection("requests")
      .doc(request.id)
      .delete();
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
        <div className="col">
          <h4>My Requests</h4>

          {this.state.requests.length === 0 ? (
            "No requests"
          ) : (
            <table className="striped">
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Description</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.requests.map(request => (
                  <tr key={request.id}>
                    <td>{request.start}</td>
                    <td>{request.end}</td>
                    <td>{request.description}</td>
                    <td>{request.manager}</td>
                    <td>
                      {request.approved === null
                        ? "Pending"
                        : request.approved
                        ? "Approved"
                        : "Declined"}
                    </td>
                    <td>
                      {request.approved === null ? (
                        <button onClick={() => this.cancelRequest(request)}>
                          Cancel Request
                        </button>
                      ) : (
                        "None"
                      )}
                    </td>
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

export default Requests;
