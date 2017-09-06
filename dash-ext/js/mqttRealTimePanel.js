
/**
 * A basic line chart displays information as a series of data points connected through
 * straight lines. It is similar to scatter plot, except that the points are connected.
 * Line charts are often used to visualize trends in data over a period.
 */
Ext.define('KitchenSink.view.charts.line.RealTimeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.line-real-time',

    onTimeChartRendered: function (chart) {
        chart.getStore().removeAll();
        this.addNewTimeData();
        this.timeChartTask = Ext.TaskManager.start({
            run: this.addNewTimeData,
            interval: 1000,
            repeat: 120,
            scope: this
        });
    },

    onAxisLabelRender: function (axis, label, layoutContext) { // only render interger values
        return Math.abs(layoutContext.renderer(label) % 1) < 1e-5 ? Math.round(label) : '';
    },

    onTimeChartDestroy: function () {
        if (this.timeChartTask) {
            Ext.TaskManager.stop(this.timeChartTask);
        }
    },

    onNumberChartRendered: function (chart) {
        chart.getStore().removeAll();
        this.addNewNumberData();
        this.numberChartTask = Ext.TaskManager.start({
            run: this.addNewNumberData,
            interval: 1000,
            repeat: 240,
            scope: this
        });
    },

    onNumberChartDestroy: function () {
        if (this.numberChartTask) {
            Ext.TaskManager.stop(this.numberChartTask);
        }
    },

    onTabChange: function (tabPanel, newCard, oldCard) {
        if (newCard.getItemId() === 'numeric') {
            Ext.TaskManager.stop(this.timeChartTask);
            Ext.TaskManager.start(this.numberChartTask);
        } else {
            Ext.TaskManager.stop(this.numberChartTask);
            Ext.TaskManager.start(this.timeChartTask);
        }
    },

    getNextValue: function (previousValue, min, max, delta) {
        delta = delta || 3;
        min = min || 0;
        max = max || 20;

        delta = Ext.Number.randomInt(-delta, delta);

        if (Ext.isNumber(previousValue)) {
            return Ext.Number.constrain(previousValue + delta, min, max);
        }
        return Ext.Number.randomInt(min, max);
    },

    addNewTimeData: function () {
        var me = this,
            chart = me.lookupReference('time-chart'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = 10000,
            second = 1000,
            xValue, lastRecord;

        if (count > 0) {
            lastRecord = store.getAt(count - 1);
            xValue = lastRecord.get('xValue') + second;
            if (xValue - me.startTime > visibleRange) {
                me.startTime = xValue - visibleRange;
                xAxis.setMinimum(this.startTime);
                xAxis.setMaximum(xValue);
            }
            store.add({
                xValue: xValue,
                metric1: me.getNextValue(lastRecord.get('metric1')),
                metric2: me.getNextValue(lastRecord.get('metric2'))
            });

        } else {
            chart.animationSuspended = true;
            me.startTime = Math.floor(Ext.Date.now() / second) * second;
            xAxis.setMinimum(me.startTime);
            xAxis.setMaximum(me.startTime + visibleRange);

            store.add({
                xValue: this.startTime,
                metric1: me.getNextValue(),
                metric2: me.getNextValue()
            });
            chart.animationSuspended = false;
        }
    },

    addNewNumberData: function () {
        var chart = this.lookupReference('number-chart'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = 20,
            minY = 0,
            maxY = 100,
            deltaY = 5,
            xValue, lastRecord;

        if (count > 0) {
            lastRecord = store.getAt(count - 1);
            xValue = lastRecord.get('xValue') + 1;
            if (xValue > visibleRange) {
                xAxis.setMinimum(xValue - visibleRange);
                xAxis.setMaximum(xValue);
            }
            store.add({
                xValue: xValue,
                yValue: this.getNextValue(lastRecord.get('yValue'), minY, maxY, deltaY)
            });

        } else {
            chart.animationSuspended = true;
            xAxis.setMinimum(0);
            xAxis.setMaximum(visibleRange);

            store.add({
                xValue: 0,
                yValue: this.getNextValue((minY + maxY) / 2, minY, maxY)
            });
            chart.animationSuspended = false;
        }
    }

});
Ext.define('Limero.store.MqttInTime', {
    extend: 'Ext.data.Store',
    alias: 'store.mqttInTime',

    //                   IE    Firefox  Chrome   Safari
    fields: ['time', 'topic1', 'topic2', 'data3', 'data4', 'other'],

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

            var record = {
                topic1: JSON.parse(msg.message),
                time: timeString(),
                topic2: 50000
            };
            store.add(record);
            if (store.count() > 50) {
                store.removeAt(0);
            };
        })
    }
});
Ext.define('Limero.mqtt.MqttRealTimePanel', {
    extend: 'Ext.tab.Panel',
    xtype: 'line-real-time',
    controller: 'line-real-time',
    resizable: true,
    draggable: true,
    width: 650,
    items: [{
        title: 'Time Axis',
        layout: 'fit',
        items: {
            xtype: 'cartesian',
            reference: 'time-chart',
            insetPadding: '40 40 20 20',
            width: '100%',
            height: 500,
            store: Ext.create('Limero.store.MqttInTime', {
                //                fields: ['yValue', 'metric1', 'metric2']
            }),
            axes: [{
                type: 'numeric',
                minimum: 0,
                maximum: 20,
                grid: true,
                position: 'left',
                title: 'Number of Hits'
            }, {
                type: 'time',
                dateFormat: 'G:i:s',
                segmenter: {
                    type: 'time',
                    step: {
                        unit: Ext.Date.SECOND,
                        step: 1
                    }
                },
                label: {
                    fontSize: 10
                },
                grid: true,
                position: 'bottom',
                title: 'Seconds',
                fields: ['xValue'],
                majorTickSteps: 10
            }],
            series: [{
                type: 'line',
                title: 'Metric 1',
                marker: {
                    type: 'cross',
                    size: 5
                },
                style: {
                    miterLimit: 0
                },
                xField: 'xValue',
                yField: 'topic1'
            }, {
                type: 'line',
                title: 'Metric 2',
                marker: {
                    type: 'arrow',
                    size: 5
                },
                style: {
                    miterLimit: 0
                },
                xField: 'xValue',
                yField: 'topic2'
            }],
            listeners: {
                afterrender: 'onTimeChartRendered',
                destroy: 'onTimeChartDestroy'
            }
        }
    }, {
        title: 'Numeric Axis',
        itemId: 'numeric',
        layout: 'fit',
        items: {
            xtype: 'cartesian',
            reference: 'number-chart',
            insetPadding: '40 40 20 20',
            width: '100%',
            height: 500,
            store: Ext.create('Ext.data.JsonStore', {
                fields: ['yValue', 'xValue']
            }),
            axes: [{
                type: 'numeric',
                minimum: 0,
                maximum: 200000,
                adjustMaximumByMajorUnit: true,
                adjustMinimumByMajorUnit: false,
                grid: true,
                position: 'left',
                title: 'heapSize'
            }, {
                type: 'numeric',
                grid: true,
                position: 'bottom',
                title: 'Seconds',
                fields: ['xValue'],
                style: {
                    textPadding: 0
                },
                renderer: 'onAxisLabelRender'
            }],
            series: [{
                type: 'line',
                title: 'Values',
                label: {
                    display: 'over',
                    field: 'yValue'
                },
                marker: {
                    radius: 4
                },
                style: {
                    lineWidth: 4,
                    miterLimit: 0
                },
                xField: 'xValue',
                yField: ['yValue']
            }],
            listeners: {
                afterrender: 'onNumberChartRendered',
                destroy: 'onNumberChartDestroy'
            }
        }
    }],

    listeners: {
        tabchange: 'onTabChange'
    }

});
