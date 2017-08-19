Ext.define('Limero.view.MqttConnectPanel', {
    extend: 'Ext.Panel',
    //    resizable: true,
    draggable: true,
    bodyPadding: 5,
    //    width: "100%",
    layout: 'hbox',
    defaultType: 'textfield',
    config: {
        topicPattern: "src/+/system/upTime"
    },
    items: [{
        fieldLabel: 'Host:port :',
        name: 'hostPort',
        value: "host:port",
        allowBlank: false,
        handler: function () {
            var args = this.value.split(':');
            myMqtt.host = args[0];
            myMqtt.port = parseInt(args[1]);
        },
        listeners: {
            afterrender: function () {
                this.value = myMqtt.host + ':' + myMqtt.port;
            },
            change: function () {
                var args = this.value.split(':');
                myMqtt.host = args[0];
                myMqtt.port = parseInt(args[1]);
            }
        }
    }, {
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
    }, {
        xtype: 'button',
        text: 'Connect',
        id: 'buttonMqttConnect2',
        handler: function () {
            if (this.text === 'Disconnect') {
                myMqtt.disconnect();
            } else {
                myMqtt.connect();
            }
        },
        listeners: {
            afterrender: function (panel) {
                eb.onLocal("mqtt/connected", function () {
                    Ext.getCmp('buttonMqttConnect2').setText("Disconnect");
                });
                eb.onLocal("mqtt/disconnected", function () {
                    Ext.getCmp('buttonMqttConnect2').setText("Connect");
                })
            }
        }
    }, {
        xtype: 'button',
        text: 'Subscribe',
        handler: function () {
            myMqtt.subscribe(this.up('panel').getTopicPattern());
        }
    }, {
        xtype: 'button',
        text: 'Unsubscribe',
        handler: function () {
            myMqtt.unsubscribe(this.up('panel').getTopicPattern());
        }
    }, {
        xtype: 'button',
        text: 'T',
        handler: function () {
            Ext.create(
                "Limero.view.MqttGrid",
                {
                    mixin: 'Ext.panel.Pinnable',
                }

            );
        }
    }, {
        xtype: 'button',
        text: 'G',
        handler: function () {
            Ext.create("Limero.view.MqttGraph", {
            });
        }
    }, {
        xtype: 'button',
        text: 'R',
        handler: function () {
            Ext.create("Limero.view.MqttRealTimePanel", {
                id: "Panel_" + Math.round(Math.random() * 1000),
                renderTo: "mqttPanel"
            });
        }
    }, {
        xtype: 'button',
        text: 'B',
        handler: function () {
            Ext.create("Limero.view.MqttBasePanel", {
                id: "Panel_" + Math.round(Math.random() * 1000),
                renderTo: "mqttPanel"
            });
        }
    }],
    initComponent: function () {
        this.callParent();

    },
    constructor: function () {
        this.callParent(arguments);
    }
});