
//==============================================================

Ext.define('Limero.view.MqttBasePanel', {
    extend: 'Ext.Panel',
    mixins: ['Ext.panel.Pinnable'],
    store: 'TopicRecords',
    alias: 'view.MqttBasePanel',
    resizable: true,
    draggable: true,
    closable: true,
    bodyPadding: 1,
    height: 300,
    width: 400,
    localForm: null,
    renderTo: Ext.getBody(),
    layout: 'fit',
    config: {
        topicPattern: 'src/+/system/alive',
        ebPattern: 'src/.*/system/alive',
        mqttListener: this.handleMessage
    },

    title: "title",
    tools: [/*{
        type: 'pin',
        handler: function (e, toolEl, panel, tc) {
            panel.up().draggable = false;
        }
    }, */{
            type: 'gear',
            handler: function (e, toolEl, panel, tc) {
                var position = e.getXY();
                e.stopEvent();
                panel.up().localForm.showAt(position);
            }
        }],

    listeners: {
        afterrender: function (panel) {
            this.setTitle(this.getTopicPattern());
            var header = panel.header;
            //            header.setHeight(20);
            this.subscribe(panel);
        },
        resize: function (target, stopEvent) {
        }
    },

    initComponent: function () {
        this.localForm = Ext.create('Limero.view.MqttFormPanel', {
            mqttBasePanel: this
        });

        this.setMqttListener(this.handleMessage);
        this.localForm.hide();
        this.callParent(arguments);

    },

    constructor: function (config) {
        this.callParent(arguments);
    },

    onDestroy: function () {
        this.localForm.destroy();
        this.callParent(arguments);
        this.unsubscribe();

    },
    // handler should be overwritten by sub classes
    handleMessage: function (msg) {
        //        this.setTitle(msg.topic);
        this.html = msg.topic + " = " + JSON.stringify(msg.message);
        log("BasePanel :" + JSON.stringify(msg));
    },

    changeTopic: function (topic) {
        this.setTitle(this.getTopicPattern());
        this.unsubscribe();
        this.setTopicPattern(topic);
        this.subscribe();
    },

    subscribe: function () {
        log(this.id);
        log(this.getId());
        var topic = this.getTopicPattern();
        this.setEbPattern(topic.replace("+", ".*").replace("#", ".*"));
        var self = this;
        eb.on(this.getEbPattern(), function (msg) {
            if (msg.topic) {
                if (msg.topic.match(self.getEbPattern()))
                    if (self.getMqttListener())
                        self.getMqttListener()(msg);
            }
        });
        myMqtt.subscribe(this.getTopicPattern());
    },
    unsubscribe: function () {
        log(" unsubscribing from event bus not implemented " + this.getEbPattern());
        myMqtt.unsubscribe(this.getTopicPattern());
    },

});

