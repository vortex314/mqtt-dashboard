
//==============================================================

Ext.define('Limero.view.MqttGrid', {
    extend: 'Limero.view.MqttBasePanel',

    initComponent: function () {
        this.callParent(arguments);
        var grid = Ext.create('Ext.grid.Panel', {
            store: Ext.create('Ext.data.Store', {
                model: 'Limero.model.TopicRecord',
                maxLogs: 500,
                data: []
            }),
            layout: 'fit',
            //            height: 200,
            //            width: 500,
            columns: [{
                text: 'Topic',
                width: "35%",
                sortable: true,
                hideable: false,
                dataIndex: 'topic'
            }, {
                text: 'Message',
                width: "40%",
                sortable: true,
                hideable: false,
                dataIndex: 'message'
            }, {
                text: 'Count',
                width: "10%",
                sortable: true,
                hideable: false,
                dataIndex: 'count'
            }, {
                text: 'Time',
                width: "15%",
                sortable: true,
                hideable: false,
                dataIndex: 'time'
            }],
            handleMqttMsg: function (msg) {
                var mqttStore = grid.store;
                if (msg.topic != undefined) {
                    var index = mqttStore.find('topic', msg.topic);
                    if (index > -1) {
                        var record = mqttStore.getAt(index);
                        record.set('message', msg.message);
                        record.set('time', timeString());
                        record.set('count', record.get('count') + 1);
                    } else {
                        var record = { topic: msg.topic, message: msg.message, count: 1, time: timeString() };
                        mqttStore.add(record);//.map(function (item) { return [item] });
                    }
                    //                    mqttStore.reload();
                }
            },
            listeners: {
                resize: function (target) {
                },
                click: function (e, t) {
                    log(e);
                }
            }
        });
        this.add(grid);
        this.setMqttListener(grid.handleMqttMsg);
    },

    onDestroy: function () {
        this.setMqttListener(null);
        this.callParent(arguments);

    },
});

