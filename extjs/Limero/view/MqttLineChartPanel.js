
/**
 * A basic line chart displays information as a series of data points connected through
 * straight lines. It is similar to scatter plot, except that the points are connected.
 * Line charts are often used to visualize trends in data over a period.
 */

Ext.define('KitchenSink.view.charts.line.BasicController', {
    extend: 'Ext.app.ViewController',

    onAxisLabelRender: function (axis, label, layoutContext) {
        // Custom renderer overrides the native axis label renderer.
        // Since we don't want to do anything fancy with the value
        // ourselves except appending a '%' sign, but at the same time
        // don't want to loose the formatting done by the native renderer,
        // we let the native renderer process the value first.
        return layoutContext.renderer(label);
    },

    onSeriesTooltipRender: function (tooltip, record, item) {
        tooltip.setHtml(record.get('time') + ': ' + record.get('topic1'));
    },

    onItemHighlightChange: function (chart, newHighlightItem, oldHighlightItem) {
        this.setSeriesLineWidth(newHighlightItem, 4);
        this.setSeriesLineWidth(oldHighlightItem, 2);
    },

    setSeriesLineWidth: function (item, lineWidth) {
        if (item) {
            item.series.setStyle({
                lineWidth: lineWidth
            });
        }
    },

    onPreview: function () {
        var chart = this.lookupReference('chart');
        chart.preview();
    }

});
Ext.define('KitchenSink.store.Browsers', {
    extend: 'Ext.data.Store',
    alias: 'store.browsers',

    //                   IE    Firefox  Chrome   Safari
    fields: ['time', 'topic1', 'data2', 'data3', 'data4', 'other'],

    constructor: function (config) {
        config = config || {};
        config.maxValue = -1E35;
        config.minValue = +1E35;
        config.store = this;

        config.data = [
        ];
        this.callParent([config]);
        this.subscribeMqtt(config);
    },
    subscribeMqtt: function (config) {
        myMqtt.subscribe("src/+/system/heap");
        eb.on("src/.*/system/heap*", function (msg) {
            var value = JSON.parse(msg.message);
            var store = config.store;

            var record = { topic1: JSON.parse(msg.message), time: timeString() };
            store.add(record);
            if (store.count() > 50) {
                store.removeAt(0);
            };
        })
    }
});

Ext.define('Limero.view.MqttLineChartPanel', {
    extend: 'Ext.Panel',
    xtype: 'line-basic',
    resizable: true,
    draggable: true,
    controller: 'line-basic',
    width: 650,
    items: {
        xtype: 'cartesian',
        reference: 'chart',
        draggable: false,
        width: '100%',
        height: 500,
        interactions: {
            type: 'panzoom',
            zoomOnPanGesture: true
        },
        animation: {
            duration: 0
        },
        store: {
            type: 'browsers'
        },
        insetPadding: 40,
        innerPadding: {
            left: 40,
            right: 40
        },
        sprites: [{
            type: 'text',
            text: 'TITLE',
            fontSize: 12,
            width: 100,
            height: 30,
            x: 40, // the sprite x position
            y: 20  // the sprite y position
        }],
        axes: [{
            type: 'numeric',
            position: 'left',
            grid: true,
            //            minimum: 0,
            //            maximum: 200000,
            adjustMaximumByMajorUnit: true,
            adjustMinimumByMajorUnit: false,
            renderer: 'onAxisLabelRender'
        }, {
            type: 'category',
            position: 'bottom',
            grid: true,
            label: {
                rotate: {
                    degrees: -45
                }
            }
        }],
        series: [{
            type: 'line',
            xField: 'time',
            yField: 'topic1',
            style: {
                lineWidth: 2
            },
            marker: {
                radius: 4,
                lineWidth: 2
            },
            /*            label: {
                            field: 'topic1',
                            display: 'over'
                        },*/
            highlight: {
                fillStyle: '#000',
                radius: 5,
                lineWidth: 2,
                strokeStyle: '#fff'
            },
            tooltip: {
                trackMouse: true,
                showDelay: 0,
                dismissDelay: 0,
                hideDelay: 0,
                renderer: 'onSeriesTooltipRender'
            }
        }],
        listeners: {
            itemhighlightchange: 'onItemHighlightChange'
        }
    },

    tbar: ['->', {
        text: 'Preview',
        handler: 'onPreview'
    }]

});

