
Ext.define('Limero.mqtt.MqttGridPanelProperties', {
    extend: 'Ext.form.Panel',
    draggable: true,
    height: 100,
    width: 250,
    layout: 'hbox',
    defaultType: 'textfield',
    items: [{
        fieldLabel: 'Topic',
        name: 'topic',
        value: "src/+/system/upTime",
        allowBlank: false,
        handler: function () {
            this.up('panel').setTopicPattern(this.value);
        },
        listeners: {
            afterrender: function () {
                this.value = this.up('panel').getTopicPattern();
            },
            change: function () {
                this.up('panel').setTopicPattern(this.value);
            }
        }
    }],
    buttons: [{
        text: 'Subscribe',
        handler: function () {
            var form = this.up('form').getForm();
            myMqtt.subscribe(this.up('panel').getTopicPattern());
            eb.onLocal("mqtt/publish", function (msg) {
                log(JSON.stringify(msg));
            })
        }
    }, {
        xtype: 'button',
        text: 'Cancel',
        handler: function () {
            //                    myMqtt.subscribe(this.up('panel').getTopicPattern());
        }
    }]
});
//==============================================================
Ext.define('Limero.mqtt.TopicRecord', {
    extend: 'Ext.data.Model',
    fields: ['topic', 'message', 'count', 'time']
});
/*mqttStore = Ext.create('Ext.data.Store', {
    model: 'Limero.mqtt.TopicRecord',
    data: [
    ]
}
);*/
Ext.define('Limero.mqtt.MqttGridPanel', {
    extend: 'Ext.grid.Panel',
    resizable: true,
    draggable: true,
    bodyPadding: 1,
    height: 300,
    width: 400,
    title: 'topics',
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
    listeners: {
        afterrender: function (grid) {
            eb.on("src/.*", function (msg) {
                var th = this;
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
            })
        }
    },
    initComponent: function () {
        var me = this;
        this.menu = this.buildMenu();
        Ext.apply(me, {
            store: Ext.create('Ext.data.Store', {
                model: 'Limero.mqtt.TopicRecord',
                data: []
            })
        });
        this.callParent(arguments);
        this.on({ scope: this, itemcontextmenu: this.onItemContextMenu })

    },
    buildMenu: function () {
        return Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Do Something'
            }]
        });
    },
    onItemContextMenu: function (view, rec, item, index, event) {
        event.stopEvent();
        this.menu.showAt(event.getXY());
    },
    onDestroy: function () {
        this.menu.destroy();
        this.callParent(arguments);
    },
});

