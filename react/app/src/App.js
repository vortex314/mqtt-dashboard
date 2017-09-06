import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MyGrid from './MyGrid.js';

class App extends Component {
  /*  constructor() {
      super();
      //    this.state = {};
    }*/

  componentWillMount() {
    this.setState({
      eb: window.eb,
      mqtt: window.myMqtt,
      log: window.log
    });
  }

  render() {
    return (
      <div className="App">
        <MyGrid eb={this.state.eb} mqtt={this.state.mqtt}>

        </MyGrid>
      </div>
    );
  }
}

export default App;
