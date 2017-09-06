import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import { Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';


class TileConnect extends Component {
    constructor(props) {
        super();
        this.onClickConnect = this.onClickConnect.bind(this);
    }
    onClickConnect(ev) {
        ev.preventDefault();
        this.props.mqtt.connect();
    }

    render() {
        return (
            <div>
                <Form inline>
                    <FormGroup controlId="formInlineName">
                        <ControlLabel>Host:Port</ControlLabel>
                        {' '}
                        <FormControl ref="connectString" inputRef={ref => { this.input = ref; }} type="text" placeholder="test.mosquitto.org:8081" bsSize="sm" />
                    </FormGroup>
                    {' '}
                    <Button type="submit" bsStyle="primary" bsSize="small" onClick={this.onClickConnect}>
                        Connect
                    </Button>
                </Form>

            </div>
        )
    }
}

export default TileConnect;