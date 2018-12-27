import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';

import GraphComponent from "./components/GraphComponent";
import * as actions from "./actions/nodeActions";

class App extends Component {
  state = {
    list: [
      'satu',
      'dua',
      'tiga'
    ]
  }

  componentDidMount() {
  }

  onDragStart = (e, name) => {
    e.dataTransfer.setData('name', name);
  }

  onDragOver = (e) => {
    e.preventDefault();
  }

  onDrop = (e) => {
    const name = e.dataTransfer.getData('name');
    let x;
    let y;
    if ((e.screenX - 420) < 10) {
      x = 10;
    } else if ((e.screenX - 420) > 598) {
      x = 598
    } else if ((e.screenX - 420) < 200) {
      x = e.screenX - 450
    } else if ((e.screenX - 420) > 400) {
      x = e.screenX - 390
    } else {
      x = e.screenX - 420
    }
    if ((e.screenY - 70) < 10) {
      y = 10;
    } else if ((e.screenY - 70) > 626) {
      y = 626
    } else if ((e.screenY - 70) < 200) {
      y = e.screenY - 100
    } else if ((e.screenY - 70) > 400) {
      y = e.screenY - 40
    } else {
      y = e.screenY - 70
    }
    this.props.addNode(x, y, name);
    // x = 10 - 598
    // y = 10 - 626
  }

  render() {
    const { list } = this.state;
    return (
      <div className="columns for-height">
        <div className="column">
          <ul className="margin">
            {
              list.map((li, idx) => (
                <li className="top-bot-mar" draggable onDragStart={(e) => this.onDragStart(e, li)} key={idx}>
                  { li }
                </li>
              ))
            }
          </ul>
        </div>
        <div className="column is-half" onDragOver={(e) => this.onDragOver(e)} onDrop={(e) => this.onDrop(e)}>
          <GraphComponent />
        </div>
        <div className="column">
          Kanan
        </div>
      </div>
    );
  };
};

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(null, mapDispatchToProps)(App);
