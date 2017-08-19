Ext.define('Limero.view.MqttFormPanel', {
    extend: 'Ext.form.Panel',
    title: 'Topic settings',
    alias: 'view.MqttData',
    renderTo: document.body,
    mqttBasePanel: null,
    viewModel: {
        data: {
            topic: "TBD",
        }
    },
    bind: {
        topic: '{topic}'
    },
    setTopic: function (blah) {
        log("setTopic" + blah);
    },
    draggable: true,
    height: 150,
    width: 300,
    bodyPadding: 10,
    defaultType: 'textfield',
    items: [
        {
            fieldLabel: 'Topic Pattern',
            name: 'topicPattern',
            bind: '{topic}'
        }
    ],
    fbar: [
        {
            type: 'button',
            text: 'OK',
            handler: function (t, e) {
                var topic = t.up('form').getViewModel().data.topic;
                log(topic);
                t.up('form').mqttBasePanel.changeTopic(topic);
                this.up('form').hide();
            }
        },
        {
            type: 'button',
            text: 'Cancel',
            handler: function (t, e) {
                this.up('form').hide();
            }
        }
    ],
    listeners: {
        afterrender: function (panel) {
            panel.getViewModel().data.topic = panel.mqttBasePanel.getTopicPattern();
        }
    }
});