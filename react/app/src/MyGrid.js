import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import TileConnect from './TileConnect.js';
import TileLog from './TileLog.js';

import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

class MyGrid extends Component {
    addTile(tile) {

    }
    render() {
        // layout is an array of objects, see the demo for more complete usage
        var layout = [
            { i: 'a', x: 0, y: 0, w: 6, h: 1 },
            { i: 'b', x: 6, y: 0, w: 6, h: 1, minW: 2, maxW: 12 },
            { i: 'c', x: 4, y: 1, w: 1, h: 2 }
        ];
        var ReactGridLayout = require('react-grid-layout');

        return (
            <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={600}>
                <div key={'a'}>
                    <TileConnect mqtt={this.props.mqtt} eb={this.props.eb} />
                </div>
                <div key={'b'}>
                    <TileLog mqtt={this.props.mqtt} eb={this.props.eb} />
                </div>
                <div key={'c'}>
                    <button type="button">Click Me!</button>
                </div>
            </ReactGridLayout>
        )
    }
}

export default MyGrid;