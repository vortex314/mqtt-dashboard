
Ext.define('Limero.mqtt.MqttPanelProperties', {
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
Ext.define('Limero.mqtt.MqttPanel', {
    extend: 'Ext.Panel',
    resizable: true,
    draggable: true,
    bodyPadding: 1,
    height: 100,
    width: 250,

    config: {
        topicPattern: "src/+/system/upTime",
        ebPattern: "src/.*/system/upTime"
    },
    listeners: {
        click: function () {
            log(" panel clicked");
        }
    },
    items: [],
    initComponent: function () {
        this.callParent(arguments);
        var toolbar = Ext.create('Ext.toolbar.Toolbar',
            {
                dock: 'left',
                width: 100,
                height: 20,
                items: [
                    {
                        xtype: 'box',
                        autoEl: { tag: 'img', src: './icons/png/anchor.png', height: 8, width: 8 }
                    },
                    { xtype: 'tbfill' },
                    {
                        xtype: 'button',
                        text: 'C',
                        labelAlign: 'left',
                        iconAlign: 'right',
                        iconOverCls: 'Information'
                    }
                ]
            }
        );
        this.add(toolbar);
    }

});

