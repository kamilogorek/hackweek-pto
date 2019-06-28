import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import firebase from "./firebase";

function defaultDate() {
  const now = new Date();
  const day = ("0" + now.getDate()).slice(-2);
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const year = now.getFullYear();
  return `${year}-${month}-${day}`;
}

class SubmitRequest extends Component {
  state = {
    statusMessage: "",
    start: defaultDate(),
    end: defaultDate(),
    totalDays: 0,
    description: ""
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();

    if (
      new Date(this.state.start).getTime() >= new Date(this.state.end).getTime()
    ) {
      this.setState({
        statusMessage: "End date cannot be same or earlier than start date."
      });
      return;
    }

    if (!this.props.user.manager) {
      this.setState({ statusMessage: "Assign your manager first." });
      return;
    }

    this.storeRequest();
  };

  storeRequest = () => {
    firebase
      .firestore()
      .collection("requests")
      .add({
        timestamp: Date.now(),
        email: this.props.user.email,
        manager: this.props.user.manager,
        start: this.state.start,
        end: this.state.end,
        totalDays: parseInt(this.state.totalDays, 10),
        description: this.state.description,
        approved: null
      })
      .then(() =>
        this.setState({
          statusMessage: "Request sent."
        })
      );
  };

  render = () => {
    if (!this.props.user) {
      return <Redirect to={{ pathname: "/" }} />;
    }

    return (
      <div className="row">
        <div className="col-6">
          <h4>Submit request</h4>
          <form onSubmit={this.handleSubmit}>
            <fieldset>
              <legend>Submit request</legend>
              <p>
                <label>Start Date (inclusive):</label>
                <input
                  name="start"
                  type="date"
                  value={this.state.start}
                  onChange={this.handleChange}
                />
              </p>

              <p>
                <label>End Date (exclusive):</label>

                <input
                  name="end"
                  type="date"
                  value={this.state.end}
                  onChange={this.handleChange}
                />
              </p>

              <p>
                <label>Total Days:</label>
                <input
                  name="totalDays"
                  type="number"
                  value={this.state.totalDays}
                  onChange={this.handleChange}
                />
              </p>

              <p>
                <label>Description:</label>
                <textarea
                  name="description"
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </p>

              {this.state.statusMessage && <p>{this.state.statusMessage}</p>}

              <p>
                <input type="submit" value="Submit" />
              </p>
            </fieldset>
          </form>
        </div>
      </div>
    );
  };
}

export default SubmitRequest;
