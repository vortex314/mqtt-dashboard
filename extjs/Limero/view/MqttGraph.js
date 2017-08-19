Ext.define('Limero.view.MqttGraph', {
    extend: 'Limero.view.MqttBasePanel',
    //    extend: 'Ext.Panel',
    //    xtype: 'chart',
    // my props
    topics: [],
    maxLogs: 10,
    topicCount: 0,
    myArray: [],
    myFields: ['time'],
    lastRecord: {},
    mySeries: [],
    myChart: null,

    createChart: function () {
        var me = this;
        var graph = Ext.create({

            xtype: 'chart',
            id: 'MyGraph',
            store: Ext.create('Ext.data.Store', {
                model: Ext.create('Ext.data.Model', {
                    fields: me.myFields
                }),
                data: []

            }),
            legend: {
                position: 'bottom',
                boxStrokeWidth: 0,
                labelFont: '12px Helvetica'
            },
            height: 410,
            style: 'background: #fff',
            padding: '10 0 0 0',
            insetPadding: 40,
            animate: true,
            shadow: false,
            axes: [{
                type: 'numeric',
                position: 'left',
                grid: true,
                adjustMaximumByMajorUnit: true,
                adjustMinimumByMajorUnit: true,
                fields: me.myFields
            }, {
                type: 'time',
                fields: 'time',
                position: 'bottom',
                dateFormat: 'h:i:s',
                fromDate: new Date(),
                toDate: Ext.Date.add(new Date(), Ext.Date.MINUTE, 1)

            }],
            series: me.mySeries
        });
        me.myChart = graph;
        me.add(graph);
    },

    destroyChart: function () {

    },
    //
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.createChart();
        me.doSubscribe();
    },

    doSubscribe: function () {
        var me = this;
        me.setTopicPattern("src/+/system/heap");
        me.setMqttListener(function (msg) {
            var record = JSON.parse(JSON.stringify(me.lastRecord));
            delete record.id;
            record[msg.topic] = JSON.parse(msg.message);
            record.time = new Date().getTime();
            me.myArray.push(record);

            if (me.topics.indexOf(msg.topic) == -1) {
                me.topics.push(msg.topic);
                me.myFields.push(msg.topic);
                me.remove('#MyGraph', true);
                me.myChart.destroy();
                me.update();
                me.mySeries.push({
                    type: 'line',
                    axis: 'left',
                    xField: 'time',
                    yField: msg.topic,
                    style: {
                        lineWidth: 2
                    },
                    markerConfig: {
                        radius: 4
                    }
                });

                me.createChart();
                //                me.myChart.store.add(record);
            };

            //         me.myChart.store.add(record);
            timeAxis = me.myChart.axes[1];
            log(timeAxis.getFromDate());
            log(timeAxis.getToDate());
            timeAxis.setFromDate(new Date(me.myArray[0].time));
            timeAxis.setToDate(new Date());
            if (me.myArray.length > me.maxLogs) {
                me.myArray.shift();
                me.myChart.store.removeAt(0);
            };
            me.lastRecord = record;
            me.myChart.store.add(record);
            //            me.myChart.store.loadData(me.myArray, true);
            log(" records in store : " + me.myChart.store.getCount());

        });
    },

    handleMqttMsg: null,
    onDestroy: function () {
        this.setMqttListener(null);
        this.callParent(arguments);
    },
});