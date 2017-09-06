import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
//import { Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';


class TileConnect extends Component {
    constructor(props) {
        super();
        this.captureLog = this.captureLog.bind(this);
        this.state = {};
    }

    captureLog(arg) {
        var logLine = JSON.stringify(arg);
        this.setState({
            logLine: logLine
        })
    }

    componentWillMount() {
        this.props.eb.on(".*",
            this.captureLog
        );
    }


    render() {
        return (
            <div>
                {this.state.logLine}
            </div>
        )
    }
}

export default TileConnect;